from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    name = Column(String)

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, unique=True, index=True)
    title = Column(String)
    content = Column(Text)

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True)
    question = Column(String)
    answer = Column(String)  # The option_ref of the correct answer e.g 'a', 'b'

    options = relationship("Option", back_populates="question", cascade="all, delete-orphan")

class Option(Base):
    __tablename__ = "options"
    id = Column(Integer, primary_key=True, index=True)
    option_ref = Column(String)  # 'a', 'b', 'c', 'd'
    text = Column(String)
    question_id = Column(Integer, ForeignKey("questions.id"))

    question = relationship("Question", back_populates="options")

class Leaderboard(Base):
    __tablename__ = "leaderboard"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    category = Column(String, index=True)
    score = Column(Integer)
    total = Column(Integer)
