CREATE TABLE Users
(
  Email CHAR(21) NOT NULL,
  Password VARCHAR(100) NOT NULL,
  PRIMARY KEY (Email)
);

CREATE TABLE Event
(
  EventName VARCHAR(40) NOT NULL,
  Date DATE NOT NULL,
  EventID INT NOT NULL,
  PRIMARY KEY (EventID)
);

CREATE TABLE Tickets
(
  TicketID INT NOT NULL,
  isForSale INT NOT NULL,
  Email CHAR(21) NOT NULL,
  EventID INT NOT NULL,
  PRIMARY KEY (TicketID),
  FOREIGN KEY (Email) REFERENCES Users(Email),
  FOREIGN KEY (EventID) REFERENCES Event(EventID)
);

CREATE TABLE Asks
(
  Price DECIMAL(9, 2) NOT NULL,
  TicketID INT NOT NULL,
  Email CHAR(21) NOT NULL,
  FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID),
  FOREIGN KEY (Email) REFERENCES Users(Email)
);

CREATE TABLE Bids
(
  Price DECIMAL(9, 2) NOT NULL,
  Email CHAR(21) NOT NULL,
  TicketID INT NOT NULL,
  FOREIGN KEY (Email) REFERENCES Users(Email),
  FOREIGN KEY (TicketID) REFERENCES Tickets(TicketID)
);