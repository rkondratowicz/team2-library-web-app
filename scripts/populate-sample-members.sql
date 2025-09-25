-- Seed data for members table
-- Creates realistic test members for library management system

INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
-- Active members (most common status)
('M001', 'Alice', 'Johnson', 'alice.johnson@email.com', '(555) 123-4567', '123 Main St, Springfield, IL 62701', 'active', '2024-01-15'),
('M002', 'Robert', 'Smith', 'robert.smith@email.com', '(555) 234-5678', '456 Oak Ave, Springfield, IL 62702', 'active', '2024-02-03'),
('M003', 'Emily', 'Davis', 'emily.davis@gmail.com', '(555) 345-6789', '789 Pine Rd, Springfield, IL 62703', 'active', '2024-02-20'),
('M004', 'Michael', 'Wilson', 'michael.wilson@email.com', '(555) 456-7890', '321 Elm St, Springfield, IL 62704', 'active', '2024-03-10'),
('M005', 'Sarah', 'Brown', 'sarah.brown@outlook.com', '(555) 567-8901', '654 Maple Dr, Springfield, IL 62705', 'active', '2024-03-25'),
('M006', 'James', 'Taylor', 'james.taylor@yahoo.com', '(555) 678-9012', '987 Cedar Ln, Springfield, IL 62706', 'active', '2024-04-12'),
('M007', 'Jessica', 'Anderson', 'jessica.anderson@email.com', '(555) 789-0123', '147 Birch Way, Springfield, IL 62707', 'active', '2024-05-08'),
('M008', 'David', 'Martinez', 'david.martinez@gmail.com', '(555) 890-1234', '258 Willow St, Springfield, IL 62708', 'active', '2024-05-30'),
('M009', 'Lisa', 'Garcia', 'lisa.garcia@email.com', '(555) 901-2345', '369 Spruce Ave, Springfield, IL 62709', 'active', '2024-06-15'),
('M010', 'Christopher', 'Rodriguez', 'chris.rodriguez@outlook.com', '(555) 012-3456', '741 Poplar Rd, Springfield, IL 62710', 'active', '2024-07-02'),
('M011', 'Amanda', 'Lewis', 'amanda.lewis@yahoo.com', '(555) 123-4567', '852 Ash Dr, Springfield, IL 62711', 'active', '2024-07-20'),
('M012', 'Daniel', 'Walker', 'daniel.walker@email.com', '(555) 234-5678', '963 Hickory Ln, Springfield, IL 62712', 'active', '2024-08-05'),
('M013', 'Michelle', 'Hall', 'michelle.hall@gmail.com', '(555) 345-6789', '159 Walnut Way, Springfield, IL 62713', 'active', '2024-08-22'),
('M014', 'Kevin', 'Allen', 'kevin.allen@email.com', '(555) 456-7890', '357 Chestnut St, Springfield, IL 62714', 'active', '2024-09-10'),
('M015', 'Stephanie', 'Young', 'stephanie.young@outlook.com', '(555) 567-8901', '468 Sycamore Ave, Springfield, IL 62715', 'active', '2024-09-18'),

-- Recently registered members (this month)
('M016', 'Matthew', 'King', 'matthew.king@gmail.com', '(555) 678-9012', '579 Dogwood Rd, Springfield, IL 62716', 'active', '2024-09-20'),
('M017', 'Nicole', 'Wright', 'nicole.wright@yahoo.com', '(555) 789-0123', '680 Magnolia Dr, Springfield, IL 62717', 'active', '2024-09-22'),
('M018', 'Ryan', 'Lopez', 'ryan.lopez@email.com', '(555) 890-1234', '791 Redwood Ln, Springfield, IL 62718', 'active', '2024-09-23'),

-- Some members without email or phone (testing optional fields)
('M019', 'Dorothy', 'Hill', NULL, NULL, '135 First Ave, Springfield, IL 62719', 'active', '2024-04-28'),
('M020', 'Frank', 'Green', 'frank.green@email.com', NULL, '246 Second St, Springfield, IL 62720', 'active', '2024-06-03'),
('M021', 'Helen', 'Adams', NULL, '(555) 012-3456', '357 Third Rd, Springfield, IL 62721', 'active', '2024-07-11'),

-- Inactive members (members who left or expired)
('M022', 'Richard', 'Baker', 'richard.baker@email.com', '(555) 123-4567', '468 Fourth Dr, Springfield, IL 62722', 'inactive', '2023-11-15'),
('M023', 'Nancy', 'Gonzalez', 'nancy.gonzalez@gmail.com', '(555) 234-5678', '579 Fifth Ln, Springfield, IL 62723', 'inactive', '2023-12-08'),
('M024', 'Paul', 'Nelson', 'paul.nelson@outlook.com', '(555) 345-6789', '680 Sixth Way, Springfield, IL 62724', 'inactive', '2024-01-22'),

-- Suspended members (disciplinary issues)
('M025', 'Karen', 'Carter', 'karen.carter@yahoo.com', '(555) 456-7890', '791 Seventh St, Springfield, IL 62725', 'suspended', '2024-03-05'),
('M026', 'Steven', 'Mitchell', 'steven.mitchell@email.com', '(555) 567-8901', '135 Eighth Ave, Springfield, IL 62726', 'suspended', '2024-05-12'),

-- Mix of registration dates for testing date ranges
('M027', 'Laura', 'Perez', 'laura.perez@gmail.com', '(555) 678-9012', '246 Ninth Rd, Springfield, IL 62727', 'active', '2023-09-10'),
('M028', 'Jason', 'Roberts', 'jason.roberts@email.com', '(555) 789-0123', '357 Tenth Dr, Springfield, IL 62728', 'active', '2023-10-25'),
('M029', 'Melissa', 'Turner', 'melissa.turner@outlook.com', '(555) 890-1234', '468 Eleventh Ln, Springfield, IL 62729', 'active', '2023-12-30'),
('M030', 'Andrew', 'Phillips', 'andrew.phillips@yahoo.com', '(555) 901-2345', '579 Twelfth Way, Springfield, IL 62730', 'active', '2024-01-08');

-- Additional members for testing search and pagination
INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
('M031', 'Mary', 'Campbell', 'mary.campbell@email.com', '(555) 111-2222', '111 University Ave, Springfield, IL 62731', 'active', '2024-02-14'),
('M032', 'Thomas', 'Parker', 'thomas.parker@gmail.com', '(555) 222-3333', '222 College St, Springfield, IL 62732', 'active', '2024-03-18'),
('M033', 'Patricia', 'Evans', 'patricia.evans@outlook.com', '(555) 333-4444', '333 School Rd, Springfield, IL 62733', 'active', '2024-04-22'),
('M034', 'Charles', 'Edwards', 'charles.edwards@yahoo.com', '(555) 444-5555', '444 Education Dr, Springfield, IL 62734', 'active', '2024-05-26'),
('M035', 'Linda', 'Collins', 'linda.collins@email.com', '(555) 555-6666', '555 Library Ln, Springfield, IL 62735', 'active', '2024-06-30'),
('M036', 'Mark', 'Stewart', 'mark.stewart@gmail.com', '(555) 666-7777', '666 Book Way, Springfield, IL 62736', 'active', '2024-07-14'),
('M037', 'Barbara', 'Sanchez', 'barbara.sanchez@outlook.com', '(555) 777-8888', '777 Reading St, Springfield, IL 62737', 'active', '2024-08-18'),
('M038', 'Donald', 'Morris', 'donald.morris@yahoo.com', '(555) 888-9999', '888 Study Ave, Springfield, IL 62738', 'active', '2024-09-01'),
('M039', 'Jennifer', 'Rogers', 'jennifer.rogers@email.com', '(555) 999-0000', '999 Knowledge Rd, Springfield, IL 62739', 'active', '2024-09-15'),
('M040', 'Joseph', 'Reed', 'joseph.reed@gmail.com', '(555) 000-1111', '1010 Wisdom Dr, Springfield, IL 62740', 'active', '2024-09-24');