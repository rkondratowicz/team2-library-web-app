-- Sample member data for library management system
-- This script populates the members table with realistic UK-based member data

INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
('MEM-2024-001', 'John', 'Smith', 'john.smith@email.com', '020 7946 0958', '123 High Street, London, SW1A 1AA', 'active', '2024-01-15'),
('MEM-2024-002', 'Sarah', 'Johnson', 'sarah.johnson@gmail.com', '0161 123 4567', '456 Oak Avenue, Manchester, M1 4BT', 'active', '2024-01-20'),
('MEM-2024-003', 'Michael', 'Brown', 'mike.brown@hotmail.co.uk', '0121 765 4321', '789 Victoria Road, Birmingham, B1 1BB', 'inactive', '2024-02-05'),
('MEM-2024-004', 'Emma', 'Wilson', 'emma.wilson@outlook.com', '0131 555 0123', '321 Royal Mile, Edinburgh, EH1 1YZ', 'active', '2024-02-10'),
('MEM-2024-005', 'James', 'Taylor', 'james.taylor@btinternet.com', '029 2034 5678', '654 Castle Street, Cardiff, CF10 1BH', 'suspended', '2024-02-15'),
('MEM-2024-006', 'Lucy', 'Davies', 'lucy.davies@virginmedia.com', '0113 234 5678', '987 Millennium Square, Leeds, LS1 4DL', 'active', '2024-02-20'),
('MEM-2024-007', 'David', 'Evans', 'david.evans@sky.com', '0117 456 7890', '147 Park Street, Bristol, BS1 5TR', 'active', '2024-02-25'),
('MEM-2024-008', 'Sophie', 'Roberts', 'sophie.roberts@talktalk.net', '0151 987 6543', '258 Bold Street, Liverpool, L1 4HY', 'active', '2024-03-01'),
('MEM-2024-009', 'Robert', 'Clark', 'rob.clark@yahoo.co.uk', '0114 321 9876', '369 Fargate, Sheffield, S1 2HF', 'active', '2024-03-05'),
('MEM-2024-010', 'Charlotte', 'Lewis', 'charlotte.lewis@icloud.com', '0115 567 8901', '741 Old Market Square, Nottingham, NG1 6FQ', 'inactive', '2024-03-10');
