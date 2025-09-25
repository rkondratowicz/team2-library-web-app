-- Seed data for members table
-- Creates realistic test members for library management system with UK details

-- First, clear existing data
DELETE FROM members;

INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
-- Active members (most common status)
('M001', 'Alice', 'Johnson', 'alice.johnson@btinternet.com', '01234 567890', '23 Victoria Street, Manchester, M1 4BT', 'active', '2024-01-15'),
('M002', 'Robert', 'Smith', 'robert.smith@gmail.com', '0207 123 4567', '45 Church Lane, London, SW1A 1AA', 'active', '2024-02-03'),
('M003', 'Emily', 'Davis', 'emily.davis@outlook.co.uk', '0121 456 7890', '12 High Street, Birmingham, B1 2JP', 'active', '2024-02-20'),
('M004', 'Michael', 'Wilson', 'michael.wilson@yahoo.co.uk', '0113 234 5678', '67 Market Square, Leeds, LS1 5AT', 'active', '2024-03-10'),
('M005', 'Sarah', 'Brown', 'sarah.brown@hotmail.co.uk', '0151 345 6789', '89 Castle Street, Liverpool, L2 7SW', 'active', '2024-03-25'),
('M006', 'James', 'Taylor', 'james.taylor@gmail.com', '0114 456 7890', '34 Park Lane, Sheffield, S1 4DP', 'active', '2024-04-12'),
('M007', 'Jessica', 'Anderson', 'jessica.anderson@btinternet.com', '0161 567 8901', '56 King Street, Manchester, M2 4WU', 'active', '2024-05-08'),
('M008', 'David', 'Martinez', 'david.martinez@outlook.co.uk', '0117 678 9012', '78 Queen Street, Bristol, BS1 4HG', 'active', '2024-05-30'),
('M009', 'Lisa', 'Garcia', 'lisa.garcia@gmail.com', '0131 789 0123', '90 Royal Mile, Edinburgh, EH1 1RE', 'active', '2024-06-15'),
('M010', 'Christopher', 'Rodriguez', 'chris.rodriguez@yahoo.co.uk', '029 2012 3456', '12 St Mary Street, Cardiff, CF10 1FA', 'active', '2024-07-02'),
('M011', 'Amanda', 'Lewis', 'amanda.lewis@hotmail.co.uk', '01273 234 567', '34 Western Road, Brighton, BN1 2AA', 'active', '2024-07-20'),
('M012', 'Daniel', 'Walker', 'daniel.walker@btinternet.com', '01865 345 678', '56 Broad Street, Oxford, OX1 3BQ', 'active', '2024-08-05'),
('M013', 'Michelle', 'Hall', 'michelle.hall@gmail.com', '01223 456 789', '78 King Street, Cambridge, CB1 1LN', 'active', '2024-08-22'),
('M014', 'Kevin', 'Allen', 'kevin.allen@outlook.co.uk', '01244 567 890', '90 Eastgate Street, Chester, CH1 1LT', 'active', '2024-09-10'),
('M015', 'Stephanie', 'Young', 'stephanie.young@yahoo.co.uk', '01904 678 901', '12 Shambles, York, YO1 7LZ', 'active', '2024-09-18'),

-- Recently registered members (this month)
('M016', 'Matthew', 'King', 'matthew.king@gmail.com', '01225 789 012', '34 Pulteney Bridge, Bath, BA1 2LR', 'active', '2024-09-20'),
('M017', 'Nicole', 'Wright', 'nicole.wright@btinternet.com', '01392 890 123', '56 High Street, Exeter, EX4 3AT', 'active', '2024-09-22'),
('M018', 'Ryan', 'Lopez', 'ryan.lopez@outlook.co.uk', '01872 901 234', '78 Lemon Street, Truro, TR1 2LW', 'active', '2024-09-23'),

-- Some members without email or phone (testing optional fields)
('M019', 'Dorothy', 'Hill', NULL, NULL, '12 The Green, Canterbury, CT1 2EH', 'active', '2024-04-28'),
('M020', 'Frank', 'Green', 'frank.green@gmail.com', NULL, '34 Market Street, Lancaster, LA1 1HP', 'active', '2024-06-03'),
('M021', 'Helen', 'Adams', NULL, '01772 123 456', '56 Fishergate, Preston, PR1 2NJ', 'active', '2024-07-11'),

-- Inactive members (members who left or expired)
('M022', 'Richard', 'Baker', 'richard.baker@yahoo.co.uk', '01482 234 567', '78 Hull Road, Hull, HU1 3RE', 'inactive', '2023-11-15'),
('M023', 'Nancy', 'Gonzalez', 'nancy.gonzalez@hotmail.co.uk', '01472 345 678', '90 Victoria Street, Grimsby, DN31 1TP', 'inactive', '2023-12-08'),
('M024', 'Paul', 'Nelson', 'paul.nelson@btinternet.com', '01733 456 789', '12 Cathedral Square, Peterborough, PE1 1XS', 'inactive', '2024-01-22'),

-- Suspended members (disciplinary issues)
('M025', 'Karen', 'Carter', 'karen.carter@outlook.co.uk', '01603 567 890', '34 Tombland, Norwich, NR3 1HF', 'suspended', '2024-03-05'),
('M026', 'Steven', 'Mitchell', 'steven.mitchell@gmail.com', '01332 678 901', '56 Iron Gate, Derby, DE1 3GP', 'suspended', '2024-05-12'),

-- Mix of registration dates for testing date ranges
('M027', 'Laura', 'Perez', 'laura.perez@yahoo.co.uk', '0191 789 0123', '78 Grey Street, Newcastle, NE1 6AE', 'active', '2023-09-10'),
('M028', 'Jason', 'Roberts', 'jason.roberts@btinternet.com', '01912 890 123', '90 Grainger Street, Newcastle, NE1 5JQ', 'active', '2023-10-25'),
('M029', 'Melissa', 'Turner', 'melissa.turner@hotmail.co.uk', '01642 901 234', '12 Linthorpe Road, Middlesbrough, TS1 1RE', 'active', '2023-12-30'),
('M030', 'Andrew', 'Phillips', 'andrew.phillips@outlook.co.uk', '01325 012 345', '34 High Row, Darlington, DL3 7QR', 'active', '2024-01-08');

-- Additional members for testing search and pagination with more UK locations
INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
('M031', 'Mary', 'Campbell', 'mary.campbell@gmail.com', '01206 123 456', '56 High Street, Colchester, CO1 1DN', 'active', '2024-02-14'),
('M032', 'Thomas', 'Parker', 'thomas.parker@yahoo.co.uk', '01245 234 567', '78 Duke Street, Chelmsford, CM1 1HL', 'active', '2024-03-18'),
('M033', 'Patricia', 'Evans', 'patricia.evans@btinternet.com', '01702 345 678', '90 High Street, Southend-on-Sea, SS1 1JF', 'active', '2024-04-22'),
('M034', 'Charles', 'Edwards', 'charles.edwards@hotmail.co.uk', '01582 456 789', '12 George Street, Luton, LU1 2AA', 'active', '2024-05-26'),
('M035', 'Linda', 'Collins', 'linda.collins@outlook.co.uk', '01923 567 890', '34 High Street, Watford, WD17 2BS', 'active', '2024-06-30'),
('M036', 'Mark', 'Stewart', 'mark.stewart@gmail.com', '01442 678 901', '56 Marlowes, Hemel Hempstead, HP1 1AA', 'active', '2024-07-14'),
('M037', 'Barbara', 'Sanchez', 'barbara.sanchez@yahoo.co.uk', '01727 789 012', '78 French Row, St Albans, AL3 5DU', 'active', '2024-08-18'),
('M038', 'Donald', 'Morris', 'donald.morris@btinternet.com', '01707 890 123', '90 Howardsgate, Welwyn Garden City, AL8 6BQ', 'active', '2024-09-01'),
('M039', 'Jennifer', 'Rogers', 'jennifer.rogers@hotmail.co.uk', '01438 901 234', '12 High Street, Stevenage, SG1 3BE', 'active', '2024-09-15'),
('M040', 'Joseph', 'Reed', 'joseph.reed@outlook.co.uk', '01279 012 345', '34 Water Lane, Bishop''s Stortford, CM23 2JZ', 'active', '2024-09-24');