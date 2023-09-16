// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract XBOT is ERC20Burnable, Ownable {
    using SafeMath for uint256;

    modifier onlyBagholders {
        require(myTokens() > 0);
        _;
    }

    modifier onlyStronghands {
        require(myDividends(true) > 0);
        _;
    }

    event onTokenPurchase(
        address indexed customerAddress,
        uint256 incomingEthereum,
        uint256 tokensMinted,
        address indexed referredBy,
        uint timestamp,
        uint256 price
	);

    event onTokenSell(
        address indexed customerAddress,
        uint256 tokensBurned,
        uint256 ethereumEarned,
        uint timestamp,
        uint256 price
	);

    event onReinvestment(
        address indexed customerAddress,
        uint256 ethereumReinvested,
        uint256 tokensMinted
	);

    event onWithdraw(
        address indexed customerAddress,
        uint256 ethereumWithdrawn
	);

    uint8 constant internal entryFee_ = 40;
    uint8 constant internal transferFee_ = 0;
    uint8 constant internal exitFee_ = 40;
    uint8 constant internal refferalFee_ = 10;
    uint256 constant internal tokenPriceInitial_ = 0.0000001 ether;
    uint256 constant internal tokenPriceIncremental_ = 0.00000001 ether;
    uint256 constant internal magnitude = 2 ** 64;
    uint256 public stakingRequirement = 50e18;
    mapping(address => uint256) internal referralBalance_;
    mapping(address => int256) internal payoutsTo_;
    uint256 internal profitPerShare_;

    constructor(
    ) ERC20("DeFiXBOT", "XBOT") {
    }

    function buy(address _referredBy) public payable{
        purchaseTokens(msg.value, _referredBy);
    }

    receive() external payable  { 
        purchaseTokens(msg.value, owner());
    }

    fallback() external payable{
        purchaseTokens(msg.value, owner());
    }

    function reinvest() onlyStronghands public {
        uint256 _dividends = myDividends(false);
        address _customerAddress = msg.sender;
        payoutsTo_[_customerAddress] +=  int256(_dividends.mul(magnitude));
        _dividends = _dividends.add(referralBalance_[_customerAddress]);
        referralBalance_[_customerAddress] = 0;
        uint256 _tokens = purchaseTokens(_dividends, address(0));
        emit onReinvestment(_customerAddress, _dividends, _tokens);
    }

    function exit() public {
        address _customerAddress = msg.sender;
        uint256 _tokens = balanceOf(_customerAddress);
        if (_tokens > 0) sell(_tokens);
        withdraw();
    }

    function withdraw() onlyStronghands public {
        address _customerAddress = msg.sender;
        uint256 _dividends = myDividends(false);
        payoutsTo_[_customerAddress] += int256(_dividends.mul(magnitude));
        _dividends = _dividends.add(referralBalance_[_customerAddress]);
        referralBalance_[_customerAddress] = 0;
        payable(_customerAddress).transfer(_dividends);
        emit onWithdraw(_customerAddress, _dividends);
    }

    function sell(uint256 _amountOfTokens) onlyBagholders public {
        address _customerAddress = msg.sender;
        require(_amountOfTokens <= balanceOf(_customerAddress));
        uint256 _ethereum = tokensToEthereum_(_amountOfTokens);
        uint256 _dividends = _ethereum.mul(exitFee_).div(100);
        uint256 _taxedEthereum = _ethereum.sub(_dividends);

        super._burn(_customerAddress, _amountOfTokens);

        int256 _updatedPayouts = int256(profitPerShare_.mul(_amountOfTokens).add(_taxedEthereum.mul(magnitude)));
        payoutsTo_[_customerAddress] -= _updatedPayouts;

        if (totalSupply() > 0) {
            profitPerShare_ = profitPerShare_.add(_dividends.mul(magnitude).div(totalSupply()));
        }
        emit onTokenSell(_customerAddress, _amountOfTokens, _taxedEthereum, block.timestamp, buyPrice());
    }

    function transfer(address _toAddress, uint256 _amountOfTokens) onlyBagholders public override returns (bool) {
        address _customerAddress = msg.sender;
        require(_amountOfTokens <= balanceOf(_customerAddress));

        if (myDividends(true) > 0) {
            withdraw();
        }

        uint256 _tokenFee = _amountOfTokens.mul(transferFee_).div(100);
        uint256 _taxedTokens = _amountOfTokens.sub(_tokenFee);
        uint256 _dividends = tokensToEthereum_(_tokenFee);

        super._burn(_customerAddress, _tokenFee);
        super.transfer(_toAddress, _taxedTokens);

        payoutsTo_[_customerAddress] -= int256(profitPerShare_.mul(_amountOfTokens));
        payoutsTo_[_toAddress] += int256(profitPerShare_.mul(_taxedTokens));
        profitPerShare_ = profitPerShare_.add(_dividends.mul(magnitude).div(totalSupply()));
        return true;
    }


    function getETHBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function myTokens() public view returns (uint256) {
        address _customerAddress = msg.sender;
        return balanceOf(_customerAddress);
    }

    function myDividends(bool _includeReferralBonus) public view returns (uint256) {
        address _customerAddress = msg.sender;
        return _includeReferralBonus ? dividendsOf(_customerAddress) + referralBalance_[_customerAddress] : dividendsOf(_customerAddress) ;
    }

    function dividendsOf(address _customerAddress) public view returns (uint256) {
        return (uint256) ((int256) (profitPerShare_ * balanceOf(_customerAddress)) - payoutsTo_[_customerAddress]) / magnitude;
    }

    function sellPrice() public view returns (uint256) {
        if (totalSupply() == 0) {
            return tokenPriceInitial_.sub(tokenPriceIncremental_);
        } else {
            uint256 _ethereum = tokensToEthereum_(1e18);
            uint256 _dividends = _ethereum.mul(exitFee_).div(100);
            uint256 _taxedEthereum = _ethereum.sub(_dividends);

            return _taxedEthereum;
        }
    }

    function buyPrice() public view returns (uint256) {
        if (totalSupply() == 0) {
            return tokenPriceInitial_.add(tokenPriceIncremental_);
        } else {
            uint256 _ethereum = tokensToEthereum_(1e18);
            uint256 _dividends = _ethereum.mul(entryFee_).div(100);
            uint256 _taxedEthereum = _ethereum.add(_dividends);

            return _taxedEthereum;
        }
    }

    function calculateTokensReceived(uint256 _ethereumToSpend) public view returns (uint256) {
        uint256 _dividends = _ethereumToSpend.mul(entryFee_).div(100);
        uint256 _taxedEthereum = _ethereumToSpend.sub(_dividends);
        uint256 _amountOfTokens = ethereumToTokens_(_taxedEthereum);

        return _amountOfTokens;
    }

    function calculateEthereumReceived(uint256 _tokensToSell) public view returns (uint256) {
        require(_tokensToSell <= totalSupply());
        uint256 _ethereum = tokensToEthereum_(_tokensToSell);
        uint256 _dividends = _ethereum.mul(exitFee_).div(100);
        uint256 _taxedEthereum = _ethereum.sub(_dividends);
        return _taxedEthereum;
    }

    function purchaseTokens(uint256 _incomingEthereum, address _referredBy) internal returns (uint256) {
        address _customerAddress = msg.sender;
        uint256 _undividedDividends = _incomingEthereum.mul(entryFee_).div(100);
        uint256 _referralBonus = _undividedDividends.mul(refferalFee_).div(100);
        uint256 _dividends = _undividedDividends.sub(_referralBonus);
        uint256 _taxedEthereum = _incomingEthereum.sub(_undividedDividends);
        uint256 _amountOfTokens = ethereumToTokens_(_taxedEthereum);
        uint256 _fee = _dividends.mul(magnitude);

        require(_amountOfTokens > 0 && _amountOfTokens.add(totalSupply()) > totalSupply());

        if (
            _referredBy != address(0) &&
            _referredBy != _customerAddress &&
            balanceOf(_referredBy) >= stakingRequirement
        ) {
            referralBalance_[_referredBy] = referralBalance_[_referredBy].add(_referralBonus);
        } else {
            _dividends = _dividends.add(_referralBonus);
            _fee = _dividends.mul(magnitude);
        }

        if (totalSupply() > 0) {
            profitPerShare_ += (_dividends.mul(magnitude).div(totalSupply()));
            _fee = _fee.sub(_fee.sub(_amountOfTokens.mul(_dividends.mul(magnitude).div(totalSupply()))));
        }

        _mint(_customerAddress, _amountOfTokens);
        int256 _updatedPayouts = int256(profitPerShare_.mul(_amountOfTokens).sub(_fee));
        payoutsTo_[_customerAddress] += _updatedPayouts;

        emit onTokenPurchase(_customerAddress, _incomingEthereum, _amountOfTokens, _referredBy, block.timestamp, buyPrice());

        return _amountOfTokens;
    }

     function ethereumToTokens_(uint256 _ethereum) internal view returns (uint256) {
        uint256 _tokenPriceInitial = tokenPriceInitial_ * 1e18;
        uint256 _tokensReceived =
            (
                (
                    (sqrt
                        (
                            (_tokenPriceInitial ** 2)
                            +
                            (2 * (tokenPriceIncremental_ * 1e18) * (_ethereum * 1e18))
                            +
                            ((tokenPriceIncremental_ ** 2) * (totalSupply() ** 2))
                            +
                            (2 * tokenPriceIncremental_ * _tokenPriceInitial*totalSupply())
                        )
                    ).sub(_tokenPriceInitial)
                ) / (tokenPriceIncremental_)
            ) - (totalSupply());

        return _tokensReceived;
    }

    function tokensToEthereum_(uint256 _tokens) internal view returns (uint256) {
        uint256 tokens_ = _tokens + 1e18;
        uint256 _tokenSupply = totalSupply() + 1e18;
        uint256 _etherReceived =
            (
                    (
                        (
                            (
                                tokenPriceInitial_ + (tokenPriceIncremental_ * (_tokenSupply / 1e18))
                            ) - tokenPriceIncremental_
                        ) * (tokens_ - 1e18)
                    ).sub(tokenPriceIncremental_ * ((tokens_ ** 2 - tokens_) / 1e18)) / 2
                / 1e18);

        return _etherReceived;
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;

        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }


}