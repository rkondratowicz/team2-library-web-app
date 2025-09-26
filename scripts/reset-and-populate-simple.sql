-- Clear and Repopulate Database Script - SIMPLIFIED
-- This script will clear all existing data and add 50 diverse members and books

-- Clear existing data (in proper order to respect foreign keys)
DELETE FROM borrowing_transactions;
DELETE FROM book_copies;
DELETE FROM books;
DELETE FROM members;

-- Reset auto-increment counters if needed
DELETE FROM sqlite_sequence WHERE name IN ('books', 'members', 'book_copies', 'borrowing_transactions');

-- Insert 50 diverse members with unique, realistic names from various cultures
INSERT INTO members (member_id, first_name, last_name, email, phone, address, status, registration_date) VALUES
('MEM-2025-001', 'Aisha', 'Okafor', 'aisha.okafor@email.com', '020 7946 1001', '15 Brixton Road, London, SW9 6AA', 'active', '2024-01-15'),
('MEM-2025-002', 'Kai', 'Nakamura', 'kai.nakamura@gmail.com', '0161 234 5678', '22 Curry Mile, Manchester, M14 5AF', 'active', '2024-01-18'),
('MEM-2025-003', 'Sofia', 'Rodriguez', 'sofia.rodriguez@outlook.com', '0121 876 5432', '88 Balti Triangle, Birmingham, B12 9QR', 'active', '2024-01-22'),
('MEM-2025-004', 'Dmitri', 'Volkov', 'dmitri.volkov@proton.me', '0131 445 7890', '7 Grassmarket, Edinburgh, EH1 2HY', 'active', '2024-01-25'),
('MEM-2025-005', 'Priya', 'Sharma', 'priya.sharma@gmail.com', '029 2087 6543', '33 City Road, Cardiff, CF24 3DL', 'active', '2024-01-28'),
('MEM-2025-006', 'Olumide', 'Adebayo', 'olumide.adebayo@yahoo.co.uk', '0113 567 8901', '44 Chapel Allerton, Leeds, LS7 3AX', 'active', '2024-02-01'),
('MEM-2025-007', 'Chen', 'Wei', 'chen.wei@hotmail.com', '0117 789 0123', '12 Cabot Circus, Bristol, BS1 3BD', 'active', '2024-02-05'),
('MEM-2025-008', 'Fatima', 'Al-Zahra', 'fatima.alzahra@email.com', '0151 345 6789', '66 Bold Street, Liverpool, L1 4HR', 'active', '2024-02-08'),
('MEM-2025-009', 'Alessandro', 'Rossi', 'alessandro.rossi@gmail.com', '0114 901 2345', '19 Division Street, Sheffield, S1 4GF', 'active', '2024-02-12'),
('MEM-2025-010', 'Zara', 'Hassan', 'zara.hassan@icloud.com', '0115 456 7890', '28 Lace Market, Nottingham, NG1 1PB', 'active', '2024-02-15'),
('MEM-2025-011', 'Luka', 'Petrov', 'luka.petrov@protonmail.com', '0116 678 9012', '5 Cultural Quarter, Leicester, LE1 6HD', 'active', '2024-02-18'),
('MEM-2025-012', 'Amara', 'Diop', 'amara.diop@gmail.com', '01482 234 5678', '14 Old Town, Hull, HU1 3DZ', 'active', '2024-02-22'),
('MEM-2025-013', 'Hiroshi', 'Tanaka', 'hiroshi.tanaka@yahoo.com', '01274 567 8901', '31 Little Germany, Bradford, BD1 5BH', 'active', '2024-02-25'),
('MEM-2025-014', 'Isabella', 'Santos', 'isabella.santos@outlook.com', '01202 890 1234', '18 Triangle, Bournemouth, BH2 5SE', 'active', '2024-02-28'),
('MEM-2025-015', 'Arjun', 'Patel', 'arjun.patel@gmail.com', '01752 123 4567', '9 Royal Citadel, Plymouth, PL1 2LR', 'active', '2024-03-03'),
('MEM-2025-016', 'Nadia', 'Kovalenko', 'nadia.kovalenko@proton.me', '01603 456 7890', '25 Norwich Lanes, Norwich, NR2 1JF', 'active', '2024-03-06'),
('MEM-2025-017', 'Marcus', 'Thompson', 'marcus.thompson@btinternet.com', '01392 789 0123', '37 Cathedral Green, Exeter, EX1 1HX', 'active', '2024-03-10'),
('MEM-2025-018', 'Leila', 'Azizi', 'leila.azizi@gmail.com', '01225 012 3456', '42 Pulteney Bridge, Bath, BA2 4AT', 'active', '2024-03-13'),
('MEM-2025-019', 'Pavel', 'Novak', 'pavel.novak@seznam.cz', '01273 345 6789', '8 North Laine, Brighton, BN1 1HF', 'active', '2024-03-16'),
('MEM-2025-020', 'Yasmin', 'Rahman', 'yasmin.rahman@hotmail.co.uk', '01223 678 9012', '16 Market Square, Cambridge, CB2 3QD', 'active', '2024-03-20'),
('MEM-2025-021', 'Enzo', 'Martinez', 'enzo.martinez@gmail.com', '01865 901 2345', '23 Cowley Road, Oxford, OX4 1HP', 'active', '2024-03-23'),
('MEM-2025-022', 'Kenji', 'Suzuki', 'kenji.suzuki@yahoo.co.jp', '01904 234 5678', '11 Shambles, York, YO1 7LZ', 'active', '2024-03-26'),
('MEM-2025-023', 'Amina', 'Benali', 'amina.benali@outlook.com', '01524 567 8901', '29 Castle Hill, Lancaster, LA1 1YN', 'active', '2024-03-30'),
('MEM-2025-024', 'Viktor', 'Nielsen', 'viktor.nielsen@gmail.com', '01872 890 1234', '34 Lemon Street, Truro, TR1 2LZ', 'active', '2024-04-02'),
('MEM-2025-025', 'Samira', 'Qasemi', 'samira.qasemi@proton.me', '01326 123 4567', '6 Church Street, Falmouth, TR11 3EG', 'active', '2024-04-05'),
('MEM-2025-026', 'Diego', 'Fernandez', 'diego.fernandez@gmail.com', '01803 456 7890', '20 Fore Street, Totnes, TQ9 5RP', 'suspended', '2024-04-08'),
('MEM-2025-027', 'Ingrid', 'Larsson', 'ingrid.larsson@hotmail.com', '01736 789 0123', '13 Wharfside, St Ives, TR26 1LP', 'active', '2024-04-12'),
('MEM-2025-028', 'Kwame', 'Asante', 'kwame.asante@yahoo.co.uk', '01970 012 3456', '27 Mill Street, Aberystwyth, SY23 1LU', 'active', '2024-04-15'),
('MEM-2025-029', 'Anastasia', 'Popov', 'anastasia.popov@gmail.com', '01248 345 6789', '4 Castle Square, Caernarfon, LL55 2AY', 'active', '2024-04-18'),
('MEM-2025-030', 'Hassan', 'Ali', 'hassan.ali@outlook.com', '028 9024 6810', '17 Titanic Quarter, Belfast, BT3 9DT', 'active', '2024-04-22'),
('MEM-2025-031', 'Mei', 'Zhou', 'mei.zhou@gmail.com', '028 7126 7890', '21 Guildhall Square, Derry, BT48 6DQ', 'active', '2024-04-25'),
('MEM-2025-032', 'Tariq', 'Mahmood', 'tariq.mahmood@hotmail.co.uk', '01463 890 1234', '35 Castle Street, Inverness, IV2 3DU', 'active', '2024-04-28'),
('MEM-2025-033', 'Elsa', 'Andersson', 'elsa.andersson@proton.me', '01224 123 4567', '10 Union Street, Aberdeen, AB11 5BN', 'active', '2024-05-01'),
('MEM-2025-034', 'Yuki', 'Watanabe', 'yuki.watanabe@yahoo.co.jp', '01382 456 7890', '24 High Street, Dundee, DD1 1TH', 'active', '2024-05-05'),
('MEM-2025-035', 'Aaliyah', 'Mohamed', 'aaliyah.mohamed@gmail.com', '01738 789 0123', '32 South Street, Perth, PH2 8PA', 'active', '2024-05-08'),
('MEM-2025-036', 'Matteo', 'Conti', 'matteo.conti@outlook.com', '01786 012 3456', '26 Port Street, Stirling, FK8 2EJ', 'active', '2024-05-12'),
('MEM-2025-037', 'Linnea', 'Johansson', 'linnea.johansson@gmail.com', '01595 345 6789', '7 Commercial Road, Lerwick, ZE1 0LX', 'active', '2024-05-15'),
('MEM-2025-038', 'Omar', 'Kaddouri', 'omar.kaddouri@proton.me', '01856 678 9012', '15 Victoria Street, Kirkwall, KW15 1DN', 'active', '2024-05-18'),
('MEM-2025-039', 'Catalina', 'Morales', 'catalina.morales@hotmail.com', '01851 901 2345', '3 Castle Street, Stornoway, HS1 2BD', 'active', '2024-05-22'),
('MEM-2025-040', 'Ravi', 'Gupta', 'ravi.gupta@gmail.com', '01478 234 5678', '12 Wentworth Street, Portree, IV51 9EJ', 'active', '2024-05-25'),
('MEM-2025-041', 'Astrid', 'Hansen', 'astrid.hansen@outlook.com', '01540 567 8901', '18 High Street, Aviemore, PH22 1PU', 'active', '2024-05-28'),
('MEM-2025-042', 'Jamal', 'Williams', 'jamal.williams@yahoo.co.uk', '01397 890 1234', '9 Cameron Square, Fort William, PH33 6AJ', 'active', '2024-06-01'),
('MEM-2025-043', 'Freya', 'Eriksen', 'freya.eriksen@gmail.com', '01687 123 4567', '22 Main Street, Mallaig, PH41 4PY', 'inactive', '2024-06-05'),
('MEM-2025-044', 'Abdel', 'Mansouri', 'abdel.mansouri@proton.me', '01499 456 7890', '14 Argyll Street, Inveraray, PA32 8UB', 'active', '2024-06-08'),
('MEM-2025-045', 'Sakura', 'Hayashi', 'sakura.hayashi@yahoo.co.jp', '01631 789 0123', '28 George Street, Oban, PA34 5SD', 'active', '2024-06-12'),
('MEM-2025-046', 'Nikolaj', 'Petersen', 'nikolaj.petersen@gmail.com', '01680 012 3456', '5 Main Street, Tobermory, PA75 6NU', 'active', '2024-06-15'),
('MEM-2025-047', 'Zeinab', 'Farah', 'zeinab.farah@outlook.com', '01972 345 6789', '16 Harbour Street, Tarbert, PA29 6UD', 'active', '2024-06-18'),
('MEM-2025-048', 'Thiago', 'Silva', 'thiago.silva@hotmail.com', '01879 678 9012', '31 Shore Street, Bowmore, PA43 7JP', 'active', '2024-06-22'),
('MEM-2025-049', 'Ingeborg', 'Olsen', 'ingeborg.olsen@proton.me', '01496 901 2345', '7 Main Street, Port Ellen, PA42 7DU', 'active', '2024-06-25'),
('MEM-2025-050', 'Rashid', 'Al-Rashid', 'rashid.alrashid@gmail.com', '01967 234 5678', '19 Pier Road, Arisaig, PH39 4NH', 'active', '2024-06-28');

-- Insert diverse collection of books across multiple genres and time periods
INSERT INTO books (id, title, author, isbn, genre, publication_year, description) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', '978-1-5011-3920-1', 'Contemporary Fiction', 2017, 'A reclusive Hollywood icon finally tells her story to an unknown journalist.'),
('550e8400-e29b-41d4-a716-446655440002', 'Klara and the Sun', 'Kazuo Ishiguro', '978-0-571-36487-2', 'Science Fiction', 2021, 'An artificial friend observes the world with wonder and hope.'),
('550e8400-e29b-41d4-a716-446655440003', 'The Midnight Library', 'Matt Haig', '978-1-78689-488-6', 'Philosophical Fiction', 2020, 'Between life and death is a library containing infinite possibilities.'),
('550e8400-e29b-41d4-a716-446655440004', 'Circe', 'Madeline Miller', '978-1-4088-9634-1', 'Mythology', 2018, 'The witch of the title tells her own story in this retelling of Greek myths.'),
('550e8400-e29b-41d4-a716-446655440005', 'The Vanishing Half', 'Brit Bennett', '978-0-349-70118-3', 'Historical Fiction', 2020, 'Twin sisters choose to live in different worlds, one black and one white.'),
('550e8400-e29b-41d4-a716-446655440006', 'Educated', 'Tara Westover', '978-0-0995-1179-5', 'Memoir', 2018, 'A memoir about education, family loyalty, and the struggle between past and future.'),
('550e8400-e29b-41d4-a716-446655440007', 'The Silent Patient', 'Alex Michaelides', '978-1-4091-8174-7', 'Psychological Thriller', 2019, 'A woman refuses to speak after allegedly murdering her husband.'),
('550e8400-e29b-41d4-a716-446655440008', 'Where the Crawdads Sing', 'Delia Owens', '978-1-4722-5020-4', 'Mystery', 2018, 'A coming-of-age murder mystery set in the marshlands of North Carolina.'),
('550e8400-e29b-41d4-a716-446655440009', 'The Thursday Murder Club', 'Richard Osman', '978-0-241-42525-6', 'Cozy Mystery', 2020, 'Four residents of a retirement village meet weekly to investigate cold cases.'),
('550e8400-e29b-41d4-a716-446655440010', 'Project Hail Mary', 'Andy Weir', '978-0-593-13520-4', 'Science Fiction', 2021, 'An astronaut wakes up alone on a spaceship with no memory of how he got there.'),
('550e8400-e29b-41d4-a716-446655440011', 'The House in the Cerulean Sea', 'TJ Klune', '978-1-250-21728-8', 'Fantasy Romance', 2020, 'A caseworker discovers a magical house full of extraordinary children.'),
('550e8400-e29b-41d4-a716-446655440012', 'Mexican Gothic', 'Silvia Moreno-Garcia', '978-1-5290-6093-7', 'Gothic Horror', 2020, 'A young woman investigates her cousin''s mysterious illness at a decaying mansion.'),
('550e8400-e29b-41d4-a716-446655440013', 'The Priory of the Orange Tree', 'Samantha Shannon', '978-1-4088-9558-0', 'Epic Fantasy', 2019, 'A standalone epic fantasy featuring dragons, magic, and political intrigue.'),
('550e8400-e29b-41d4-a716-446655440014', 'Normal People', 'Sally Rooney', '978-0-571-33465-3', 'Literary Fiction', 2018, 'The complex relationship between two Irish teenagers through school and university.'),
('550e8400-e29b-41d4-a716-446655440015', 'The Invisible Life of Addie LaRue', 'V.E. Schwab', '978-1-7847-0149-7', 'Urban Fantasy', 2020, 'A woman cursed to be forgotten by everyone she meets lives for 300 years.'),
('550e8400-e29b-41d4-a716-446655440016', 'Hamnet', 'Maggie O''Farrell', '978-1-4722-4290-2', 'Historical Fiction', 2020, 'A fictional account of the death of Shakespeare''s son and its impact on the family.'),
('550e8400-e29b-41d4-a716-446655440017', 'The Sanatorium', 'Sarah Pearse', '978-1-7871-2504-9', 'Crime Thriller', 2021, 'A detective investigates disappearances at a remote Swiss hotel.'),
('550e8400-e29b-41d4-a716-446655440018', 'Pachinko', 'Min Jin Lee', '978-1-7868-9187-7', 'Historical Saga', 2017, 'A multi-generational saga of a Korean family in Japan.'),
('550e8400-e29b-41d4-a716-446655440019', 'The Poppy War', 'R.F. Kuang', '978-0-0062-6928-4', 'Dark Fantasy', 2018, 'A military fantasy inspired by 20th-century Chinese history.'),
('550e8400-e29b-41d4-a716-446655440020', 'Americanah', 'Chimamanda Ngozi Adichie', '978-0-0074-8664-1', 'Literary Fiction', 2013, 'A powerful story about identity, belonging, and race across three continents.');