// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import './interfaces/IBreezyWhitelist.sol';


contract BreezySwapV1BREWETH is ERC20Burnable, Ownable, Pausable, ReentrancyGuard {
    
    using SafeMath for uint256;

    IERC20Metadata public base; // Stable coin base token (WETH)
    IERC20Metadata public token; // Token to trade in this pair

    // Declare state variables for decimals
    uint8 public baseDecimals;
    uint8 public tokenDecimals;

    // Fee Machine Contract.
    address public feeMachineContract; 

    IBreezyWhitelist public whitelistContract; 

    uint256 public TRADE_FEE = 2; //0.2% 2/1000

    address public platformFundAddress;

    modifier onlyWhitelist()
    {
        if (msg.sender != tx.origin) {
            require(whitelistContract.whitelisted(msg.sender) == true, 'INVALID_WHITELIST');
        }
        _;
    }


    // Events

    event onSwapBaseToTokenWithBaseInput(address sender, uint256 minTokenOutput, uint256 baseInputAmount, uint256 tokenOutputAmount, uint256 poolBaseBalance, uint256 poolTokenBalance);
    event onSwapBaseToTokenWithTokenOutput(address sender, uint256 maxBaseInput, uint256 baseInputAmount, uint256 tokenOutputAmount, uint256 poolBaseBalance, uint256 poolTokenBalance);
    
    event onSwapTokenToBaseWithTokenInput(address sender, uint256 minBaseOutput, uint256 tokenInputAmount, uint256 baseOutputAmount, uint256 poolBaseBalance, uint256 poolTokenBalance);
    event onSwapTokenToBaseWithBaseOutput(address sender, uint256 maxTokenInput, uint256 tokenInputAmount, uint256 baseOutputAmount, uint256 poolBaseBalance, uint256 poolTokenBalance);

    event onAddLP(address sender, uint256 mintLP, uint256 baseInputAmount, uint256 tokenInputAmount, uint256 poolBaseBalance, uint256 poolTokenBalance);
    event onRemoveLP(address sender, uint256 amountLP, uint256 baseOutputAmout, uint256 tokenOutputAmount, uint256 poolBaseBalance, uint256 poolTokenBalance);

    constructor(
        IERC20Metadata _base,
        IERC20Metadata _token,
        address _feeMachineContract,
        IBreezyWhitelist _whitelistContract,
        string memory name, 
        string memory symbol
        ) ERC20(name, symbol) {
        base = _base;
        token = _token;
        whitelistContract = _whitelistContract;
        feeMachineContract = _feeMachineContract;
        platformFundAddress = _msgSender();
        baseDecimals = base.decimals();
        tokenDecimals = token.decimals();
    }
    
    function setWhitelistContract(address _whitelistContract) public onlyOwner {
        require(_whitelistContract != address(0), "INVALID_ADDRESS");

        whitelistContract = IBreezyWhitelist(_whitelistContract);
    }

    function setFeeMachineContract(address _feeMachineContract) public onlyOwner {
        require(_feeMachineContract != address(0), "INVALID_ADDRESS");

        feeMachineContract = _feeMachineContract;
    }

    function setTradeFee(uint256 _tradeFee) public onlyOwner {
        TRADE_FEE = _tradeFee;
    }

    function setPlatformFundAdress(address newAddress) public onlyOwner {
        platformFundAddress = newAddress;
    }

    function getK() public view returns(uint256) {
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();
        uint256 k = tokenReserve.mul(baseReserve);
        return k;
    }

    function getTokenOutput(uint256 baseInputAmount) public view returns (uint256) {
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseInputAmount to 18 decimals
        baseInputAmount = baseInputAmount.mul(10**uint256(18 - baseDecimals));

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

        uint256 tradeFee = baseInputAmount.mul(TRADE_FEE).div(1000);
        uint256 baseInputAmountAfterFee = baseInputAmount.sub(tradeFee); // cut the TRADE_FEE from base input

        uint256 tokenOutputAmount = getTokenOutputAmountFromBaseInput(baseInputAmountAfterFee, baseReserve, tokenReserve);
        return tokenOutputAmount.div(10**uint256(18 - tokenDecimals));
    }

    function getBaseOutput(uint256 tokenInputAmount) public view returns (uint256) {
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale tokenInputAmount to 18 decimals
        tokenInputAmount = tokenInputAmount.mul(10**uint256(18 - tokenDecimals));

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

        uint256 tradeFee = tokenInputAmount.mul(TRADE_FEE).div(1000);
        uint256 tokenInputAmountAfterFee = tokenInputAmount.sub(tradeFee); // cut the TRADE_FEE from token input

        uint256 baseOutputAmount = getBaseOutputAmountFromTokenInput(tokenInputAmountAfterFee, baseReserve, tokenReserve);
        return baseOutputAmount.div(10**uint256(18 - baseDecimals));
    }

    function getDataFromBaseInputToAddLp(uint256 baseInputAmount) public view returns (uint256, uint256) {
        uint256 totalSupply = totalSupply();
        uint256 mintLP = 0;
        uint256 tokenInputAmount = 0;

        // Scale baseInputAmount to 18 decimals
        baseInputAmount = baseInputAmount.mul(10**uint256(18 - baseDecimals));

        if(totalSupply == 0) {
            mintLP = baseInputAmount;
            tokenInputAmount = baseInputAmount;
        }
        else { 
            // tokenReserve/baseReserve = (tokenReserve+tokenInputAmount)/(baseReserve+baseInputAmount)
            // => tokenReserve+tokenInputAmount = tokenReserve*(baseReserve+baseInputAmount)/baseReserve
            // => tokenInputAmount = tokenReserve*(baseReserve+baseInputAmount)/baseReserve - tokenReserve;
            uint256 baseReserve = 0;
            uint256 tokenReserve = 0;
            (baseReserve, tokenReserve) = getTotalReserve();

            // Scale baseReserve to 18 decimals
            baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

            // Scale tokenReserve to 18 decimals
            tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

            tokenInputAmount = tokenReserve.mul(baseReserve.add(baseInputAmount)).div(baseReserve).sub(tokenReserve);

            // mintLP/totalLP =  baseInputAmount/baseReserve
            // mintLP = totalLP*baseInputAmount/baseReserve
            mintLP = totalSupply.mul(baseInputAmount).div(baseReserve);
        }
        return (mintLP, tokenInputAmount.div(10**uint256(18 - tokenDecimals)));
    }

    function getDataFromTokenInputToAddLp(uint256 tokenInputAmount) public view returns (uint256, uint256) {
        uint256 totalSupply = totalSupply();
        uint256 mintLP;
        uint256 baseInputAmount;

        // Scale tokenInputAmount to 18 decimals
        tokenInputAmount = tokenInputAmount.mul(10**uint256(18 - tokenDecimals));

        if(totalSupply == 0) {
            mintLP = tokenInputAmount;
            baseInputAmount = tokenInputAmount;
        }
        else { 
            // tokenReserve/baseReserve = (tokenReserve+tokenInputAmount)/(baseReserve+baseInputAmount)
            // => (baseReserve+baseInputAmount) = (tokenReserve+tokenInputAmount) * baseReserve / tokenReserve
            //  => baseInputAmount = (tokenReserve+tokenInputAmount) * baseReserve / tokenReserve - baseReserve
            uint256 baseReserve = 0;
            uint256 tokenReserve = 0;
            (baseReserve, tokenReserve) = getTotalReserve();

            // Scale baseReserve to 18 decimals
            baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

            // Scale tokenReserve to 18 decimals
            tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

            baseInputAmount = baseReserve.mul(tokenReserve.add(tokenInputAmount)).div(tokenReserve).sub(baseReserve);

            // mintLP/totalLP =  baseInputAmount/baseReserve
            // mintLP = totalLP*baseInputAmount/baseReserve
            mintLP = totalSupply.mul(baseInputAmount).div(baseReserve);
        }
        return (mintLP, baseInputAmount.div(10**uint256(18 - baseDecimals)));
    }

    function getDataToRemoveLP(uint256 amountLP) public view returns (uint256, uint256){
        
        uint256 totalSupply = totalSupply();

        if (amountLP > totalSupply) {
            amountLP = totalSupply;
        } 
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));
        
        // amountLP/totalSupply = baseOutputAmount/baseReserve
        // => baseOutputAmount = amountLP*baseReserve/totalSupply
        uint256 baseOutputAmount = amountLP.mul(baseReserve).div(totalSupply);
        uint256 tokenOutputAmount = amountLP.mul(tokenReserve).div(totalSupply);
        
        return (baseOutputAmount.div(10**uint256(18 - baseDecimals)), tokenOutputAmount.div(10**uint256(18 - tokenDecimals)));
    }
    
    // token*base=(token-tokenOutputAmount)*(base+baseInputAmount)
    //token-tokenOutputAmount = token*base/(base+baseInputAmount)
    // => tokenOutputAmount=token - token*base/(base+baseInputAmount)
    function getTokenOutputAmountFromBaseInput(uint256 baseInputAmount, uint256 baseReserve, uint256 tokenReserve) public pure returns (uint256) {
      require(baseReserve > 0 && tokenReserve > 0, "INVALID_VALUE");
      uint256 numerator = tokenReserve.mul(baseReserve);
      uint256 denominator = baseReserve.add(baseInputAmount);
      uint256 tokenOutputAmount = tokenReserve.sub(numerator.div(denominator));
      return tokenOutputAmount;
    }
    
    // token*base=(token-tokenOutputAmount)*(base+baseInputAmount)
    // base+baseInputAmount = token*base/(token-tokenOutputAmount)
    //baseInputAmount = token*base/(token-tokenOutputAmount) - base;
    function getBaseInputAmountFromTokenOutput(uint256 tokenOutputAmount, uint256 baseReserve, uint256 tokenReserve) public pure  returns (uint256) {
      require(baseReserve > 0 && tokenReserve > 0, "INVALID_VALUE");
      uint256 numerator = tokenReserve.mul(baseReserve);
      uint256 denominator = tokenReserve.sub(tokenOutputAmount);
      uint256 baseInputAmount = numerator.div(denominator).sub(baseReserve);
      return baseInputAmount;
    }
    
    // token*base=(token+tokenInputAmount)*(base-baseOutputAmount)
    // => base - baseOutputAmount=token*base/(token+tokenInputAmount)
    // => baseOutputAmount = base - token*base/(token+tokenInputAmount)
    function getBaseOutputAmountFromTokenInput(uint256 tokenInputAmount, uint256 baseReserve, uint256 tokenReserve) public pure returns (uint256) {
      require(baseReserve > 0 && tokenReserve > 0, "INVALID_VALUE");
      uint256 numerator = tokenReserve.mul(baseReserve);
      uint256 denominator = tokenReserve.add(tokenInputAmount);
      uint256 baseOutputAmount = baseReserve.sub(numerator.div(denominator));
      return baseOutputAmount;
    }

    // token*base=(token+tokenInputAmount)*(base-baseOutputAmount)
    // => token+tokenInputAmount = token*base/(base-baseOutputAmount)
    // => tokenInputAmount = token*base/(base-baseOutputAmount) - token
    function getTokenInputAmountFromBaseOutput(uint256 baseOutputAmount, uint256 baseReserve, uint256 tokenReserve) public pure returns (uint256) {
      require(baseReserve > 0 && tokenReserve > 0, "INVALID_VALUE");
      uint256 numerator = tokenReserve.mul(baseReserve);
      uint256 denominator = baseReserve.sub(baseOutputAmount);
      uint256 tokenInputAmount = numerator.div(denominator).sub(tokenReserve);
      return tokenInputAmount;
    }

    function swapBaseToTokenWithBaseInput(uint256 baseInputAmount, uint256 minTokenOutput, uint256 deadline) public onlyWhitelist whenNotPaused nonReentrant {
        require(deadline >= block.timestamp, 'INVALID_DEADLINE');
        require(baseInputAmount > 0, 'INVALID_BASE_INPUT');
        require(minTokenOutput > 0, 'INVALID_MIN_TOKEN_OUTPUT');
        
        uint256 userBaseBalance = base.balanceOf(msg.sender);
        if(baseInputAmount > userBaseBalance) {
            baseInputAmount = userBaseBalance;
        }

        // Scale baseInputAmount to 18 decimals
        baseInputAmount = baseInputAmount.mul(10**uint256(18 - baseDecimals));

        // Scale minTokenOutput to 18 decimals
        minTokenOutput = minTokenOutput.mul(10**uint256(18 - tokenDecimals));
        
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

        require(minTokenOutput < tokenReserve, "MIN_TOKEN_HIGHER_POOL_TOKEN_BALANCE");

        uint256 tradeFee = baseInputAmount.mul(TRADE_FEE).div(1000);
        uint256 baseInputAmountAfterFee = baseInputAmount.sub(tradeFee); // cut the TRADE_FEE from base input
        
        uint256 tokenOutputAmount = getTokenOutputAmountFromBaseInput(baseInputAmountAfterFee, baseReserve, tokenReserve);

        require(tokenOutputAmount >= minTokenOutput, 'CAN_NOT_MAKE_TRADE');
        require(tokenOutputAmount < tokenReserve, 'TOKEN_OUTPUT_HIGHER_POOL_TOKEN_BALANCE');
        require(tokenOutputAmount.div(10**uint256(18 - tokenDecimals)) < token.balanceOf(address(this)), 'TOKEN_OUTPUT_HIGHER_CURRENT_TRADE_BALANCE');
        
        //make trade
        base.transferFrom(msg.sender, address(this), baseInputAmount.div(10**uint256(18 - baseDecimals)));
        token.transfer(msg.sender, tokenOutputAmount.div(10**uint256(18 - tokenDecimals)));

        //transfer fee
        base.transfer(feeMachineContract, tradeFee.div(10**uint256(18 - baseDecimals)));

        emit onSwapBaseToTokenWithBaseInput(
            msg.sender,
            minTokenOutput.div(10**uint256(18 - tokenDecimals)),
            baseInputAmount.div(10**uint256(18 - baseDecimals)),
            tokenOutputAmount.div(10**uint256(18 - tokenDecimals)),
            baseReserve.div(10**uint256(18 - baseDecimals)),
            tokenReserve.div(10**uint256(18 - tokenDecimals))
        );

    }

    function swapBaseToTokenWithTokenOutput(uint256 maxBaseInput, uint256 tokenOutputAmount, uint256 deadline) public onlyWhitelist whenNotPaused nonReentrant{
        require(deadline >= block.timestamp, 'INVALID_DEADLINE');
        require(maxBaseInput > 0, 'INVALID_MAX_BASE_INPUT');
        require(tokenOutputAmount > 0, 'INVALID_TOKEN_OUTPUT');
        require(tokenOutputAmount < token.balanceOf(address(this)), 'TOKEN_OUTPUT_HIGHER_CURRENT_TRADE_BALANCE');

        // Scale maxBaseInput to 18 decimals
        maxBaseInput = maxBaseInput.mul(10**uint256(18 - baseDecimals));

        // Scale tokenOutputAmount to 18 decimals
        tokenOutputAmount = tokenOutputAmount.mul(10**uint256(18 - tokenDecimals));
        
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

        require(tokenOutputAmount < tokenReserve, "TOKEN_OUTPUT_HIGHER_POOL_TOKEN_BALANCE");

        uint256 baseInputAmount = getBaseInputAmountFromTokenOutput(tokenOutputAmount, baseReserve, tokenReserve);
        
        uint256 tradeFee = baseInputAmount.mul(TRADE_FEE).div(1000);
        baseInputAmount = baseInputAmount.add(tradeFee); // add the TRADE_FEE to base input

        require(baseInputAmount <= maxBaseInput, 'CAN_NOT_MAKE_TRADE');
        require(baseInputAmount > 0, 'INVALID_BASE_INPUT');
        require(baseInputAmount <= base.balanceOf(msg.sender).mul(10**uint256(18 - baseDecimals)), 'BASE_INPUT_HIGHER_USER_BALANCE');
        
        // Make trade
        base.transferFrom(msg.sender, address(this), baseInputAmount.div(10**uint256(18 - baseDecimals)));
        token.transfer(msg.sender, tokenOutputAmount.div(10**uint256(18 - tokenDecimals)));

        // Transfer fee
        base.transfer(feeMachineContract, tradeFee.div(10**uint256(18 - baseDecimals)));

        emit onSwapBaseToTokenWithTokenOutput(
            msg.sender,
            maxBaseInput,
            baseInputAmount.div(10**uint256(18 - baseDecimals)),
            tokenOutputAmount.div(10**uint256(18 - tokenDecimals)),
            baseReserve.div(10**uint256(18 - baseDecimals)),
            tokenReserve.div(10**uint256(18 - tokenDecimals))
        );
    }

    function swapTokenToBaseWithTokenInput(uint256 tokenInputAmount, uint256 minBaseOutput, uint256 deadline) public onlyWhitelist whenNotPaused nonReentrant {
        require(deadline >= block.timestamp, 'INVALID_DEADLINE');
        require(minBaseOutput > 0, 'INVALID_MIN_BASE_OUTPUT');
        require(tokenInputAmount > 0, 'INVALID_TOKEN_INPUT');

        uint256 userTokenBalance = token.balanceOf(msg.sender);
        if(tokenInputAmount > userTokenBalance) {
            tokenInputAmount = userTokenBalance;
        }

        // Scale tokenInputAmount to 18 decimals
        tokenInputAmount = tokenInputAmount.mul(10**uint256(18 - tokenDecimals));

        // Scale minBaseOutput to 18 decimals
        minBaseOutput = minBaseOutput.mul(10**uint256(18 - baseDecimals));

        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

        require(minBaseOutput < baseReserve, 'MIN_BASE_OUTPUT_HIGHER_POOL_BASE_BALANCE');

        uint256 tradeFee = tokenInputAmount.mul(TRADE_FEE).div(1000);
        uint256 tokenInputAmountAfterFee = tokenInputAmount.sub(tradeFee); // cut the TRADE_FEE from token input
        
        uint256 baseOutputAmount = getBaseOutputAmountFromTokenInput(tokenInputAmountAfterFee, baseReserve, tokenReserve);

        require(baseOutputAmount >= minBaseOutput, 'CAN_NOT_MAKE_TRADE');
        require(baseOutputAmount < baseReserve, 'BASE_OUTPUT_HIGHER_POOL_BASE_BALANCE');
        require(baseOutputAmount < base.balanceOf(address(this)).mul(10**uint256(18 - baseDecimals)), 'BASE_OUTPUT_HIGHER_CURRENT_TRADE_BALANCE');

        // Make trade
        token.transferFrom(msg.sender, address(this), tokenInputAmount.div(10**uint256(18 - tokenDecimals)));
        base.transfer(msg.sender, baseOutputAmount.div(10**uint256(18 - baseDecimals)));

        // Transfer fee
        token.transfer(feeMachineContract, tradeFee.div(10**uint256(18 - tokenDecimals)));

        emit onSwapTokenToBaseWithTokenInput(
            msg.sender,
            minBaseOutput.div(10**uint256(18 - baseDecimals)),
            tokenInputAmount.div(10**uint256(18 - tokenDecimals)),
            baseOutputAmount.div(10**uint256(18 - baseDecimals)),
            baseReserve.div(10**uint256(18 - baseDecimals)),
            tokenReserve.div(10**uint256(18 - tokenDecimals))
        );
    }

    function swapTokenToBaseWithBaseOutput(uint256 maxTokenInput, uint256 baseOutputAmount, uint256 deadline) public onlyWhitelist whenNotPaused nonReentrant {
        require(deadline >= block.timestamp, 'INVALID_DEADLINE');
        require(maxTokenInput > 0, 'INVALID_MAX_TOKEN_INPUT');
        require(baseOutputAmount > 0, 'INVALID_BASE_OUTPUT');
        require(baseOutputAmount < base.balanceOf(address(this)), 'BASE_OUTPUT_HIGHER_CURRENT_TRADE_BALANCE');
        
        // Scale maxTokenInput to 18 decimals
        maxTokenInput = maxTokenInput.mul(10**uint256(18 - tokenDecimals));

        // Scale baseOutputAmount to 18 decimals
        baseOutputAmount = baseOutputAmount.mul(10**uint256(18 - baseDecimals));

        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

        require(baseOutputAmount < baseReserve, 'BASE_OUTPUT_HIGHER_POOL_BASE_BALANCE');

        uint256 tokenInputAmount = getTokenInputAmountFromBaseOutput(baseOutputAmount, baseReserve, tokenReserve);
        
        uint256 tradeFee = tokenInputAmount.mul(TRADE_FEE).div(1000);
        tokenInputAmount = tokenInputAmount.add(tradeFee); // add the TRADE_FEE to token input

        require(tokenInputAmount <= maxTokenInput, 'CAN_NOT_MAKE_TRADE');
        require(tokenInputAmount > 0, 'INVALID_TOKEN_INPUT');
        require(tokenInputAmount <= token.balanceOf(msg.sender).mul(10**uint256(18 - tokenDecimals)), 'TOKEN_INPUT_HIGHER_USER_BALANCE');

        // Make trade
        token.transferFrom(msg.sender, address(this), tokenInputAmount.div(10**uint256(18 - tokenDecimals)));
        base.transfer(msg.sender, baseOutputAmount.div(10**uint256(18 - baseDecimals)));

        // Transfer fee
        token.transfer(feeMachineContract, tradeFee.div(10**uint256(18 - tokenDecimals)));

        emit onSwapTokenToBaseWithBaseOutput(
            msg.sender,
            maxTokenInput.div(10**uint256(18 - tokenDecimals)),
            tokenInputAmount.div(10**uint256(18 - tokenDecimals)),
            baseOutputAmount.div(10**uint256(18 - baseDecimals)),
            baseReserve.div(10**uint256(18 - baseDecimals)),
            tokenReserve.div(10**uint256(18 - tokenDecimals))
        );
    }

    function addLP(uint256 minLP, uint256 baseInputAmount, uint256 maxTokenInputAmount, uint256 deadline) public onlyWhitelist nonReentrant returns (uint256) {
        require(deadline >= block.timestamp, 'INVALID_DEADLINE');
        require(minLP > 0, 'INVALID_MIN_LP');
        require(baseInputAmount > 0, 'INVALID_BASE_INPUT');
        require(maxTokenInputAmount > 0, 'INVALID_MAX_TOKEN_INPUT');

        uint256 userBaseBalance = base.balanceOf(msg.sender);
        if(baseInputAmount > userBaseBalance) {
            baseInputAmount = userBaseBalance;
        }

        // Scale baseInputAmount to 18 decimals
        baseInputAmount = baseInputAmount.mul(10**uint256(18 - baseDecimals));

        // Scale maxTokenInputAmount to 18 decimals
        maxTokenInputAmount = maxTokenInputAmount.mul(10**uint256(18 - tokenDecimals));
        
        uint256 totalSupply = totalSupply();
        if(totalSupply == 0) {
            // Scale back to respective decimals for transfer
            base.transferFrom(msg.sender, address(this), baseInputAmount.div(10**uint256(18 - baseDecimals)));
            token.transferFrom(msg.sender, address(this), maxTokenInputAmount.div(10**uint256(18 - tokenDecimals)));
            
            uint256 initLP = baseInputAmount;
            _mint(msg.sender, initLP);
            emit onAddLP(msg.sender, initLP, baseInputAmount.div(10**uint256(18 - baseDecimals)), maxTokenInputAmount.div(10**uint256(18 - tokenDecimals)), base.balanceOf(address(this)), token.balanceOf(address(this)));
            return initLP;
        }
        else { 
            // tokenReserve/baseReserve = (tokenReserve+tokenInputAmount)/(baseReserve+baseInputAmount)
            // => tokenReserve+tokenInputAmount = tokenReserve*(baseReserve+baseInputAmount)/baseReserve
            // => tokenInputAmount = tokenReserve*(baseReserve+baseInputAmount)/baseReserve - tokenReserve;
            uint256 baseReserve = 0;
            uint256 tokenReserve = 0;
            (baseReserve, tokenReserve) = getTotalReserve();

            // Scale baseReserve to 18 decimals
            baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

            // Scale tokenReserve to 18 decimals
            tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));

            uint256 tokenInputAmount = tokenReserve.mul(baseReserve.add(baseInputAmount)).div(baseReserve).sub(tokenReserve);

            // mintLP/totalLP =  baseInputAmount/baseReserve
            // mintLP = totalLP*baseInputAmount/baseReserve
            uint256 mintLP = totalSupply.mul(baseInputAmount).div(baseReserve);
            
            require(tokenInputAmount > 0, 'INVALID_TOKEN_INPUT');
            require(tokenInputAmount.div(10**uint256(18 - tokenDecimals)) <= maxTokenInputAmount.div(10**uint256(18 - tokenDecimals)), 'INVALID_TOKEN_INPUT');
            require(mintLP >= minLP, "INVALID_MINT_LP");

            base.transferFrom(msg.sender, address(this), baseInputAmount.div(10**uint256(18 - baseDecimals)));
            token.transferFrom(msg.sender, address(this), tokenInputAmount.div(10**uint256(18 - tokenDecimals)));

            _mint(msg.sender, mintLP);
            emit onAddLP(msg.sender, mintLP, baseInputAmount.div(10**uint256(18 - baseDecimals)), tokenInputAmount.div(10**uint256(18 - tokenDecimals)), base.balanceOf(address(this)), token.balanceOf(address(this)));
            return mintLP;
        }
    }

    function removeLP(uint256 amountLP, uint256 minBaseOutput, uint256 minTokenOutput, uint256 deadline) public onlyWhitelist nonReentrant returns (uint256, uint256) {
        require(deadline >= block.timestamp, 'INVALID_DEADLINE');
        require(amountLP > 0, 'INVALID_AMOUNT_LP');
        require(minBaseOutput > 0, 'INVALID_MIN_BASE_OUTPUT');
        require(minTokenOutput > 0, 'INVALID_MIN_TOKEN_OUTPUT');

        // Scale minBaseOutput to 18 decimals
        minBaseOutput = minBaseOutput.mul(10**uint256(18 - baseDecimals));

        // Scale maxTokenInputAmount to 18 decimals
        minTokenOutput = minTokenOutput.mul(10**uint256(18 - tokenDecimals));
        
        uint256 totalSupply = totalSupply();
        
        uint256 userLPbalance = balanceOf(msg.sender);
        if(amountLP > userLPbalance) {
            amountLP = userLPbalance;
        }

        require(amountLP <= totalSupply, 'INVALID_AMOUNT_LP_TOTAL_SUPPLY');
         
        uint256 baseReserve = 0;
        uint256 tokenReserve = 0;
        (baseReserve, tokenReserve) = getTotalReserve();

        // Scale baseReserve to 18 decimals
        baseReserve = baseReserve.mul(10**uint256(18 - baseDecimals));

        // Scale tokenReserve to 18 decimals
        tokenReserve = tokenReserve.mul(10**uint256(18 - tokenDecimals));
        
        // amountLP/totalSupply = baseOutputAmount/baseReserve
        // => baseOutputAmount = amountLP*baseReserve/totalSupply
        uint256 baseOutputAmount = amountLP.mul(baseReserve).div(totalSupply);
        uint256 tokenOutputAmount = amountLP.mul(tokenReserve).div(totalSupply);

        require(baseOutputAmount >= minBaseOutput, "INVALID_BASE_OUTPUT");
        require(tokenOutputAmount >= minTokenOutput, "INVALID_TOKEN_OUTPUT");
        require(baseOutputAmount <= baseReserve, "BASE_OUTPUT_HIGHER_BASE_BALANCE");
        require(tokenOutputAmount <= tokenReserve, "TOKEN_OUTPUT_HIGHER_TOKEN_BALANCE");

        _burn(msg.sender, amountLP);
        // Scale back to respective decimals for transfer
        base.transfer(msg.sender, baseOutputAmount.div(10**uint256(18 - baseDecimals)));
        token.transfer(msg.sender, tokenOutputAmount.div(10**uint256(18 - tokenDecimals)));

        emit onRemoveLP(msg.sender, amountLP, baseOutputAmount.div(10**uint256(18 - baseDecimals)), tokenOutputAmount.div(10**uint256(18 - tokenDecimals)), base.balanceOf(address(this)), token.balanceOf(address(this)));

        return (baseOutputAmount.div(10**uint256(18 - baseDecimals)), tokenOutputAmount.div(10**uint256(18 - tokenDecimals)));
    }

    function getTotalReserve() public view returns (uint256, uint256) { 
        uint256 baseReserve = base.balanceOf(address(this));
        uint256 tokenReserve = token.balanceOf(address(this));

        return (baseReserve, tokenReserve);
    }

    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
}