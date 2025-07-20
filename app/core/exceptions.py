"""
Core domain exceptions for the application.
"""


class DomainException(Exception):
    """Base exception for domain-specific errors."""

    pass


class PriceServiceException(DomainException):
    """Exception raised when price service operations fail."""

    pass


class HoldingServiceException(DomainException):
    """Exception raised when holding service operations fail."""

    pass


class CacheException(DomainException):
    """Exception raised when cache operations fail."""

    pass


class RateLimitException(DomainException):
    """Exception raised when API rate limits are exceeded."""

    pass


class ValidationException(DomainException):
    """Exception raised when validation fails."""

    pass
