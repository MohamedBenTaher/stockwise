# Update the user model to include relationship
from sqlalchemy.orm import relationship

# Add this to the User class in user.py:
# holdings = relationship("Holding", back_populates="user")
