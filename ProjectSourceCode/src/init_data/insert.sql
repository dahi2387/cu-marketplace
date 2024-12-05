INSERT INTO users (email, password) 
    VALUES ('asdf1234@colorado.edu', '$2y$10$NcSlyZmB3dpoBQKZ..fPdOBd0iTly9IFtdbnLPy5.tlEw8BJypmT6');

INSERT INTO Event (EventName, Date, EventID)
    VALUES ("CU vs. UCLA", '2024-10-28', 1)

INSERT INTO Tickets (TicketID, isForSale, Email, EventID)
    VALUES (1, 0, 'asdf1234@colorado.edu', 1)