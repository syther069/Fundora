// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// node_modules/@openzeppelin/contracts/utils/Errors.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/Errors.sol)

/**
 * @dev Collection of common custom errors used in multiple contracts
 *
 * IMPORTANT: Backwards compatibility is not guaranteed in future versions of the library.
 * It is recommended to avoid relying on the error API for critical functionality.
 *
 * _Available since v5.1._
 */
library Errors {
    /**
     * @dev The ETH balance of the account is not enough to perform the operation.
     */
    error InsufficientBalance(uint256 balance, uint256 needed);

    /**
     * @dev A call to an address target failed. The target may have reverted.
     */
    error FailedCall();

    /**
     * @dev The deployment failed.
     */
    error FailedDeployment();

    /**
     * @dev A necessary precompile is missing.
     */
    error MissingPrecompile(address);
}

// node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// node_modules/@openzeppelin/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

// node_modules/@openzeppelin/contracts/utils/Address.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/Address.sol)

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev There's no code at `target` (it is not a contract).
     */
    error AddressEmptyCode(address target);

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.20/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        if (address(this).balance < amount) {
            revert Errors.InsufficientBalance(address(this).balance, amount);
        }

        (bool success, ) = recipient.call{value: amount}("");
        if (!success) {
            revert Errors.FailedCall();
        }
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason or custom error, it is bubbled
     * up by this function (like regular Solidity function calls). However, if
     * the call reverted with no returned reason, this function reverts with a
     * {Errors.FailedCall} error.
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     */
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     */
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        if (address(this).balance < value) {
            revert Errors.InsufficientBalance(address(this).balance, value);
        }
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return verifyCallResultFromTarget(target, success, returndata);
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and reverts if the target
     * was not a contract or bubbling up the revert reason (falling back to {Errors.FailedCall}) in case
     * of an unsuccessful call.
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata
    ) internal view returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            // only check if target is a contract if the call was successful and the return data is empty
            // otherwise we already know that it was a contract
            if (returndata.length == 0 && target.code.length == 0) {
                revert AddressEmptyCode(target);
            }
            return returndata;
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and reverts if it wasn't, either by bubbling the
     * revert reason or with a default {Errors.FailedCall} error.
     */
    function verifyCallResult(bool success, bytes memory returndata) internal pure returns (bytes memory) {
        if (!success) {
            _revert(returndata);
        } else {
            return returndata;
        }
    }

    /**
     * @dev Reverts with returndata if present. Otherwise reverts with {Errors.FailedCall}.
     */
    function _revert(bytes memory returndata) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            assembly ("memory-safe") {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert Errors.FailedCall();
        }
    }
}

// node_modules/@openzeppelin/contracts/interfaces/IERC165.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC165.sol)

// node_modules/@openzeppelin/contracts/interfaces/IERC20.sol

// OpenZeppelin Contracts (last updated v5.0.0) (interfaces/IERC20.sol)

// node_modules/@openzeppelin/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.1.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}

// contracts/Fundora.sol

contract Fundora is ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum GrantStatus {
        Open,
        Active,
        Completed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        SubmittedForReview,
        Approved,
        Rejected
    }

    struct Grant {
        string title;
        string description;
        address funder;
        address builder;
        uint128 totalAmount;
        uint128 releasedAmount;
        uint8 milestoneCount;
        uint8 approvedMilestoneCount;
        GrantStatus status;
        uint40 createdAt;
        uint40 deadline;
    }

    struct Milestone {
        uint8 index;
        string title;
        string description;
        uint128 amount;
        MilestoneStatus status;
        address submittedBy;
        bytes32 evidenceHash;
        uint40 submittedAt;
        uint40 approvedAt;
    }

    struct VoteCount {
        uint128 approvals;
        uint128 rejections;
    }

    error NotAdmin();
    error NotReviewer();
    error NotBuilder();
    error AlreadyVoted();
    error InvalidGrant();
    error InvalidMilestone();
    error InvalidStatus();
    error ArrayLengthMismatch();
    error ZeroAddress();
    error ZeroAmount();
    error InsufficientApprovers();
    error Paused();
    error DeadlineExpired();
    error MaxMilestonesExceeded();
    error NoRefundDue();
    error AdminCannotBeBuilder();
    error NotExpired();
    error BatchTooLarge();

    event AdminSet(address indexed admin);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    event ReviewerAdded(address indexed reviewer);
    event ReviewerRemoved(address indexed reviewer);
    event RequiredApprovalsChanged(uint256 oldVal, uint256 newVal);
    event GrantCreated(uint256 indexed grantId, string title, address indexed creator);
    event GrantFunded(uint256 indexed grantId, uint256 amount, address indexed funder);
    event GrantApplied(uint256 indexed grantId, address indexed builder);
    event MilestoneSubmitted(
        uint256 indexed grantId,
        uint256 indexed milestoneIndex,
        string evidenceUri,
        address indexed builder
    );
    event MilestoneReviewCast(
        uint256 indexed grantId,
        uint256 indexed milestoneIndex,
        address indexed reviewer,
        bool approved
    );
    event MilestoneApproved(uint256 indexed grantId, uint256 indexed milestoneIndex, uint256 amount, address indexed builder);
    event MilestonePaymentQueued(uint256 indexed grantId, uint256 indexed milestoneIndex, uint256 amount, address indexed builder);
    event PaymentClaimed(address indexed builder, uint256 amount);
    event GrantCompleted(uint256 indexed grantId, address indexed builder);
    event GrantCancelled(uint256 indexed grantId, address indexed admin);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);
    event GrantExpired(uint256 indexed grantId);
    event BuilderReassigned(uint256 indexed grantId, address indexed oldBuilder, address indexed newBuilder);
    event FunderRefundQueued(uint256 indexed grantId, uint256 amount, address indexed funder);
    event FunderRefundClaimed(address indexed funder, uint256 amount);
    event GrantDeadlineSet(uint256 indexed grantId, uint40 deadline);

    uint8 public constant MAX_MILESTONES = 20;

    IERC20 public usdc;
    address public admin;
    uint256 public grantCount;
    uint256 public reviewerCount;
    uint256 public requiredApprovals;
    uint128 public totalFunded;
    bool public paused;

    mapping(address => bool) public isReviewer;
    mapping(uint256 => Grant) public grants;
    mapping(uint256 => mapping(uint256 => Milestone)) public milestones;
    mapping(uint256 => mapping(uint256 => uint256)) public milestoneRound;
    mapping(uint256 => mapping(uint256 => mapping(uint256 => mapping(address => bool)))) public milestoneVotes;
    mapping(uint256 => mapping(uint256 => VoteCount)) public voteCounts;
    mapping(address => uint128) public pendingWithdrawals;
    mapping(address => uint128) public pendingFunderRefunds;

    modifier onlyAdmin() {
        if (msg.sender != admin) revert NotAdmin();
        _;
    }

    modifier onlyReviewer() {
        if (!isReviewer[msg.sender]) revert NotReviewer();
        _;
    }

    modifier whenNotPaused() {
        if (paused) revert Paused();
        _;
    }

    constructor(address _usdc, address _initialAdmin, uint256 _requiredApprovals) {
        if (_usdc == address(0) || _initialAdmin == address(0)) revert ZeroAddress();
        if (_requiredApprovals == 0) revert ZeroAmount();

        usdc = IERC20(_usdc);
        admin = _initialAdmin;
        requiredApprovals = _requiredApprovals;

        emit AdminSet(_initialAdmin);
    }

    function addReviewer(address reviewer) external onlyAdmin {
        if (reviewer == address(0)) revert ZeroAddress();
        if (isReviewer[reviewer]) revert InvalidStatus();

        isReviewer[reviewer] = true;
        reviewerCount += 1;

        emit ReviewerAdded(reviewer);
    }

    function removeReviewer(address reviewer) external onlyAdmin {
        if (reviewer == address(0)) revert ZeroAddress();
        if (!isReviewer[reviewer]) revert InvalidStatus();
        if (reviewerCount - 1 < requiredApprovals) revert InsufficientApprovers();

        isReviewer[reviewer] = false;
        reviewerCount -= 1;

        emit ReviewerRemoved(reviewer);
    }

    function setRequiredApprovals(uint256 n) external onlyAdmin {
        if (n == 0) revert ZeroAmount();
        if (reviewerCount > 0 && n > reviewerCount) revert InsufficientApprovers();

        uint256 old = requiredApprovals;
        requiredApprovals = n;

        emit RequiredApprovalsChanged(old, n);
    }

    function createGrant(
        string calldata title,
        string calldata description,
        uint256 milestoneCount,
        string[] calldata milestoneTitles,
        string[] calldata milestoneDescs,
        uint256[] calldata milestoneAmounts,
        uint40 deadline
    ) external onlyAdmin returns (uint256 grantId) {
        if (milestoneCount == 0) revert ZeroAmount();
        if (milestoneCount > MAX_MILESTONES) revert MaxMilestonesExceeded();
        if (deadline != 0 && deadline <= block.timestamp) revert DeadlineExpired();
        if (
            milestoneTitles.length != milestoneCount
                || milestoneDescs.length != milestoneCount
                || milestoneAmounts.length != milestoneCount
        ) revert ArrayLengthMismatch();

        uint128 totalAmount;
        for (uint256 i = 0; i < milestoneCount; i++) {
            uint128 amount = uint128(milestoneAmounts[i]);
            if (amount == 0) revert ZeroAmount();

            totalAmount += amount;

            milestones[grantCount + 1][i] = Milestone({
                index: uint8(i),
                title: milestoneTitles[i],
                description: milestoneDescs[i],
                amount: amount,
                status: MilestoneStatus.Pending,
                submittedBy: address(0),
                evidenceHash: bytes32(0),
                submittedAt: 0,
                approvedAt: 0
            });
        }

        if (totalAmount == 0) revert ZeroAmount();

        grantCount += 1;
        grantId = grantCount;

        grants[grantId] = Grant({
            title: title,
            description: description,
            funder: address(0),
            builder: address(0),
            totalAmount: totalAmount,
            releasedAmount: 0,
            milestoneCount: uint8(milestoneCount),
            approvedMilestoneCount: 0,
            status: GrantStatus.Open,
            createdAt: uint40(block.timestamp),
            deadline: deadline
        });

        emit GrantCreated(grantId, title, msg.sender);
        emit GrantDeadlineSet(grantId, deadline);
    }

    function fundGrant(uint256 grantId) external onlyAdmin whenNotPaused nonReentrant {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Open) revert InvalidStatus();
        if (grant.totalAmount == 0) revert ZeroAmount();
        if (reviewerCount < requiredApprovals) revert InsufficientApprovers();

        usdc.safeTransferFrom(msg.sender, address(this), grant.totalAmount);

        grant.funder = msg.sender;
        grant.status = GrantStatus.Active;
        totalFunded += grant.totalAmount;

        emit GrantFunded(grantId, grant.totalAmount, msg.sender);
    }

    function applyForGrant(uint256 grantId) external whenNotPaused {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (grant.builder != address(0)) revert InvalidStatus();
        if (isReviewer[msg.sender]) revert InvalidStatus();
        if (msg.sender == admin) revert AdminCannotBeBuilder();

        grant.builder = msg.sender;

        emit GrantApplied(grantId, msg.sender);
    }

    function submitMilestoneEvidence(uint256 grantId, uint256 milestoneIndex, string calldata evidenceUri)
        external
        whenNotPaused
    {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.builder != msg.sender) revert NotBuilder();
        if (grant.status != GrantStatus.Active) revert InvalidStatus();

        Milestone storage milestone = _requireValidMilestone(grantId, milestoneIndex);
        if (milestone.status != MilestoneStatus.Pending && milestone.status != MilestoneStatus.Rejected) {
            revert InvalidStatus();
        }

        milestoneRound[grantId][milestoneIndex] += 1;
        voteCounts[grantId][milestoneIndex] = VoteCount({approvals: 0, rejections: 0});

        bytes32 hash = keccak256(abi.encodePacked(evidenceUri));

        milestone.status = MilestoneStatus.SubmittedForReview;
        milestone.submittedBy = msg.sender;
        milestone.evidenceHash = hash;
        milestone.submittedAt = uint40(block.timestamp);

        emit MilestoneSubmitted(grantId, milestoneIndex, evidenceUri, msg.sender);
    }

    function reviewMilestone(uint256 grantId, uint256 milestoneIndex, bool approve)
        external
        onlyReviewer
        whenNotPaused
        nonReentrant
    {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (grant.builder == address(0)) revert InvalidStatus();
        if (reviewerCount < requiredApprovals) revert InsufficientApprovers();

        Milestone storage milestone = _requireValidMilestone(grantId, milestoneIndex);
        if (milestone.status != MilestoneStatus.SubmittedForReview) revert InvalidStatus();

        uint256 round = milestoneRound[grantId][milestoneIndex];
        if (milestoneVotes[grantId][milestoneIndex][round][msg.sender]) revert AlreadyVoted();

        milestoneVotes[grantId][milestoneIndex][round][msg.sender] = true;

        VoteCount storage vc = voteCounts[grantId][milestoneIndex];

        if (approve) {
            vc.approvals += 1;

            if (vc.approvals >= requiredApprovals) {
                milestone.status = MilestoneStatus.Approved;
                milestone.approvedAt = uint40(block.timestamp);

                uint128 amount = milestone.amount;
                grant.releasedAmount += amount;
                pendingWithdrawals[grant.builder] += uint128(amount);
                grant.approvedMilestoneCount += 1;

                emit MilestonePaymentQueued(grantId, milestoneIndex, amount, grant.builder);
                emit MilestoneApproved(grantId, milestoneIndex, amount, grant.builder);

                if (grant.approvedMilestoneCount >= grant.milestoneCount) {
                    grant.status = GrantStatus.Completed;
                    emit GrantCompleted(grantId, grant.builder);
                }
            }
        } else {
            vc.rejections += 1;

            if (vc.rejections > reviewerCount - requiredApprovals) {
                milestone.status = MilestoneStatus.Rejected;
            }
        }

        emit MilestoneReviewCast(grantId, milestoneIndex, msg.sender, approve);
    }

    function claimPayment() external nonReentrant {
        uint128 amount = pendingWithdrawals[msg.sender];
        if (amount == 0) revert ZeroAmount();

        pendingWithdrawals[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit PaymentClaimed(msg.sender, amount);
    }

    function cancelGrant(uint256 grantId) external onlyAdmin {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Open && grant.status != GrantStatus.Active) revert InvalidStatus();

        uint128 unreleased = grant.totalAmount - grant.releasedAmount;
        grant.status = GrantStatus.Cancelled;

        if (grant.funder != address(0) && unreleased > 0) {
            pendingFunderRefunds[grant.funder] += uint128(unreleased);
            emit FunderRefundQueued(grantId, unreleased, grant.funder);
        }

        emit GrantCancelled(grantId, msg.sender);
    }

    function claimFunderRefund() external nonReentrant {
        uint128 amount = pendingFunderRefunds[msg.sender];
        if (amount == 0) revert NoRefundDue();

        pendingFunderRefunds[msg.sender] = 0;
        usdc.safeTransfer(msg.sender, amount);

        emit FunderRefundClaimed(msg.sender, amount);
    }

    function adminReassignBuilder(uint256 grantId, address newBuilder) external onlyAdmin {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (newBuilder == address(0)) revert ZeroAddress();
        if (isReviewer[newBuilder]) revert InvalidStatus();
        if (newBuilder == admin) revert AdminCannotBeBuilder();

        address oldBuilder = grant.builder;

        for (uint8 i = 0; i < grant.milestoneCount; i++) {
            Milestone storage milestone = milestones[grantId][i];
            if (milestone.status == MilestoneStatus.SubmittedForReview) {
                milestone.status = MilestoneStatus.Pending;
                voteCounts[grantId][i] = VoteCount({approvals: 0, rejections: 0});
                milestoneRound[grantId][i] += 1;
            }
        }

        grant.builder = newBuilder;

        emit BuilderReassigned(grantId, oldBuilder, newBuilder);
    }

    function expireGrant(uint256 grantId) external {
        Grant storage grant = _requireValidGrant(grantId);
        if (grant.status != GrantStatus.Active) revert InvalidStatus();
        if (grant.deadline == 0 || block.timestamp <= uint256(grant.deadline)) revert NotExpired();

        uint128 unreleased = grant.totalAmount - grant.releasedAmount;
        grant.status = GrantStatus.Cancelled;

        if (grant.funder != address(0) && unreleased > 0) {
            pendingFunderRefunds[grant.funder] += uint128(unreleased);
            emit FunderRefundQueued(grantId, unreleased, grant.funder);
        }

        emit GrantExpired(grantId);
    }

    function pause() external onlyAdmin {
        paused = true;
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyAdmin {
        paused = false;
        emit ContractUnpaused(msg.sender);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        if (newAdmin == address(0)) revert ZeroAddress();

        address oldAdmin = admin;
        admin = newAdmin;

        emit AdminTransferred(oldAdmin, newAdmin);
    }

    function getGrant(uint256 grantId) external view returns (Grant memory) {
        return _requireValidGrant(grantId);
    }

    function getMilestone(uint256 grantId, uint256 milestoneIndex) external view returns (Milestone memory) {
        return _requireValidMilestone(grantId, milestoneIndex);
    }

    function getReviewerVote(uint256 grantId, uint256 milestoneIndex, address reviewer) external view returns (bool) {
        uint256 round = milestoneRound[grantId][milestoneIndex];
        return milestoneVotes[grantId][milestoneIndex][round][reviewer];
    }

    function getMilestoneRound(uint256 grantId, uint256 milestoneIndex) external view returns (uint256) {
        return milestoneRound[grantId][milestoneIndex];
    }

    function getMilestoneApprovalCount(uint256 grantId, uint256 milestoneIndex) external view returns (uint256) {
        return voteCounts[grantId][milestoneIndex].approvals;
    }

    function getMilestoneVoteCounts(uint256 grantId, uint256 milestoneIndex)
        external
        view
        returns (uint128 approvals, uint128 rejections)
    {
        VoteCount storage vc = voteCounts[grantId][milestoneIndex];
        return (vc.approvals, vc.rejections);
    }

    function getGrantsBatch(uint256 fromId, uint256 toId) external view returns (Grant[] memory) {
        if (fromId == 0 || toId < fromId || toId > grantCount) revert InvalidGrant();
        if (toId - fromId > 50) revert BatchTooLarge();

        uint256 length = toId - fromId + 1;
        Grant[] memory batch = new Grant[](length);

        for (uint256 i = 0; i < length; i++) {
            batch[i] = grants[fromId + i];
        }

        return batch;
    }

    function _requireValidGrant(uint256 grantId) internal view returns (Grant storage grant) {
        if (grantId == 0 || grantId > grantCount) revert InvalidGrant();
        grant = grants[grantId];
    }

    function _requireValidMilestone(uint256 grantId, uint256 milestoneIndex)
        internal
        view
        returns (Milestone storage milestone)
    {
        Grant storage grant = _requireValidGrant(grantId);
        if (milestoneIndex >= grant.milestoneCount) revert InvalidMilestone();
        milestone = milestones[grantId][milestoneIndex];
    }
}
