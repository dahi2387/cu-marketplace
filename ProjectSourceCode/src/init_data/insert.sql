INSERT INTO Users (Email, Password) 
    VALUES 
    ('asdf1234@colorado.edu', '$2y$10$NcSlyZmB3dpoBQKZ..fPdOBd0iTly9IFtdbnLPy5.tlEw8BJypmT6'),
    ('abc@colorado.edu', '456');

INSERT INTO Event (EventName, Date, EventID)
    VALUES ('CU vs. UCLA', '2024-10-28', 1);

INSERT INTO Tickets (TicketID, isForSale, Email, EventID)
    VALUES
    (1, 0, 'asdf1234@colorado.edu', 1),
    (2, 0, 'asdf1234@colorado.edu', 1),
    (3, 1, 'asdf1234@colorado.edu', 1),
    (4, 1, 'asdf1234@colorado.edu', 1),
    (5, 0, 'asdf1234@colorado.edu', 1);