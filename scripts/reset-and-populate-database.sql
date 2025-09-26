-- Clear and Repopulate Database Script
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
('550e8400-e29b-41d4-a716-446655440020', 'Americanah', 'Chimamanda Ngozi Adichie', '978-0-0074-8664-1', 'Literary Fiction', 2013, 'A powerful story about identity, belonging, and race across three continents.'),
('550e8400-e29b-41d4-a716-446655440021', 'The Water Will Come', 'Jeff Goodell', '978-0-316-26024-4', 'Environmental Science', 2017, 'An urgent look at the reality of rising seas and climate change.'),
('550e8400-e29b-41d4-a716-446655440022', 'Sapiens', 'Yuval Noah Harari', '978-0-0993-6352-2', 'Anthropology', 2014, 'A brief history of humankind from the Stone Age to the present.'),
('550e8400-e29b-41d4-a716-446655440023', 'The Righteous Mind', 'Jonathan Haidt', '978-0-141-03916-8', 'Psychology', 2012, 'Why good people are divided by politics and religion.'),
('550e8400-e29b-41d4-a716-446655440024', 'Braiding Sweetgrass', 'Robin Wall Kimmerer', '978-1-5717-1335-9', 'Nature Writing', 2013, 'Indigenous wisdom, scientific knowledge, and the teachings of plants.'),
('550e8400-e29b-41d4-a716-446655440025', 'The Body Keeps the Score', 'Bessel van der Kolk', '978-0-670-78593-3', 'Psychology', 2014, 'Brain, mind, and body in the healing of trauma.'),
('550e8400-e29b-41d4-a716-446655440026', 'Dune', 'Frank Herbert', '978-0-340-96019-1', 'Science Fiction', 1965, 'Epic science fiction novel set on the desert planet Arrakis.'),
('550e8400-e29b-41d4-a716-446655440027', 'The Name of the Wind', 'Patrick Rothfuss', '978-0-7564-0474-1', 'Epic Fantasy', 2007, 'The legendary tale of Kvothe, told by himself.'),
('550e8400-e29b-41d4-a716-446655440028', 'Station Eleven', 'Emily St. John Mandel', '978-0-8041-7244-8', 'Post-Apocalyptic Fiction', 2014, 'Interconnected stories spanning decades before and after a pandemic.'),
('550e8400-e29b-41d4-a716-446655440029', 'The Fifth Season', 'N.K. Jemisin', '978-0-316-22922-7', 'Science Fantasy', 2015, 'A world where seismic catastrophes reshape continents.'),
('550e8400-e29b-41d4-a716-446655440030', 'Beloved', 'Toni Morrison', '978-1-4000-3341-6', 'Historical Fiction', 1987, 'A haunting tale of slavery and its lasting trauma.'),
('550e8400-e29b-41d4-a716-446655440031', 'One Hundred Years of Solitude', 'Gabriel García Márquez', '978-0-06-088328-8', 'Magical Realism', 1967, 'The multi-generational story of the Buendía family.'),
('550e8400-e29b-41d4-a716-446655440032', 'The Alchemist', 'Paulo Coelho', '978-0-06-112241-5', 'Philosophical Fiction', 1988, 'A shepherd boy''s journey to find treasure and discover his destiny.'),
('550e8400-e29b-41d4-a716-446655440033', 'Persepolis', 'Marjane Satrapi', '978-0-375-71457-3', 'Graphic Memoir', 2000, 'A memoir in graphic novel form about growing up in Iran.'),
('550e8400-e29b-41d4-a716-446655440034', 'The Handmaid''s Tale', 'Margaret Atwood', '978-0-385-49081-8', 'Dystopian Fiction', 1985, 'A dystopian novel about reproductive rights and authoritarianism.'),
('550e8400-e29b-41d4-a716-446655440035', 'Neuromancer', 'William Gibson', '978-0-441-56956-9', 'Cyberpunk', 1984, 'A groundbreaking cyberpunk novel about hackers and artificial intelligence.'),
('550e8400-e29b-41d4-a716-446655440036', 'The Joy Luck Club', 'Amy Tan', '978-0-14-303428-3', 'Family Saga', 1989, 'The relationships between Chinese-American women and their mothers.'),
('550e8400-e29b-41d4-a716-446655440037', 'Wild', 'Cheryl Strayed', '978-0-307-59273-6', 'Travel Memoir', 2012, 'A memoir about hiking the Pacific Crest Trail after personal tragedy.'),
('550e8400-e29b-41d4-a716-446655440038', 'The Kite Runner', 'Khaled Hosseini', '978-1-59448-000-3', 'Historical Fiction', 2003, 'A story of friendship and redemption set against Afghanistan''s tumultuous history.'),
('550e8400-e29b-41d4-a716-446655440039', 'Life of Pi', 'Yann Martel', '978-0-15-602732-2', 'Adventure', 2001, 'A boy survives 227 days stranded on a lifeboat with a Bengal tiger.'),
('550e8400-e29b-41d4-a716-446655440040', 'The God of Small Things', 'Arundhati Roy', '978-0-06-097749-2', 'Literary Fiction', 1997, 'A story of family, forbidden love, and tragedy in Kerala, India.');

-- Insert book copies with random quantities (1-5 copies per book)
INSERT INTO book_copies (id, book_id, copy_number, status) VALUES
-- Book 1: The Seven Husbands of Evelyn Hugo (3 copies)
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '001', 'Available'),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', '002', 'Available'),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', '003', 'Available'),

-- Book 2: Klara and the Sun (2 copies)
('CPY-002-001', '550e8400-e29b-41d4-a716-446655440002', 'available', 'Science Fiction B2'),
('CPY-002-002', '550e8400-e29b-41d4-a716-446655440002', 'available', 'Science Fiction B2'),

-- Book 3: The Midnight Library (4 copies)
('CPY-003-001', '550e8400-e29b-41d4-a716-446655440003', 'available', 'Fiction Section A2'),
('CPY-003-002', '550e8400-e29b-41d4-a716-446655440003', 'available', 'Fiction Section A2'),
('CPY-003-003', '550e8400-e29b-41d4-a716-446655440003', 'available', 'Fiction Section A2'),
('CPY-003-004', '550e8400-e29b-41d4-a716-446655440003', 'available', 'Fiction Section A2'),

-- Book 4: Circe (1 copy)
('CPY-004-001', '550e8400-e29b-41d4-a716-446655440004', 'available', 'Mythology Section C1'),

-- Book 5: The Vanishing Half (5 copies)
('CPY-005-001', '550e8400-e29b-41d4-a716-446655440005', 'available', 'Fiction Section A3'),
('CPY-005-002', '550e8400-e29b-41d4-a716-446655440005', 'available', 'Fiction Section A3'),
('CPY-005-003', '550e8400-e29b-41d4-a716-446655440005', 'available', 'Fiction Section A3'),
('CPY-005-004', '550e8400-e29b-41d4-a716-446655440005', 'available', 'Fiction Section A3'),
('CPY-005-005', '550e8400-e29b-41d4-a716-446655440005', 'available', 'Fiction Section A3'),

-- Book 6: Educated (3 copies)
('CPY-006-001', '550e8400-e29b-41d4-a716-446655440006', 'available', 'Biography D1'),
('CPY-006-002', '550e8400-e29b-41d4-a716-446655440006', 'available', 'Biography D1'),
('CPY-006-003', '550e8400-e29b-41d4-a716-446655440006', 'available', 'Biography D1'),

-- Book 7: The Silent Patient (2 copies)
('CPY-007-001', '550e8400-e29b-41d4-a716-446655440007', 'available', 'Thriller E1'),
('CPY-007-002', '550e8400-e29b-41d4-a716-446655440007', 'available', 'Thriller E1'),

-- Book 8: Where the Crawdads Sing (4 copies)
('CPY-008-001', '550e8400-e29b-41d4-a716-446655440008', 'available', 'Mystery E2'),
('CPY-008-002', '550e8400-e29b-41d4-a716-446655440008', 'available', 'Mystery E2'),
('CPY-008-003', '550e8400-e29b-41d4-a716-446655440008', 'available', 'Mystery E2'),
('CPY-008-004', '550e8400-e29b-41d4-a716-446655440008', 'available', 'Mystery E2'),

-- Book 9: The Thursday Murder Club (1 copy)
('CPY-009-001', '550e8400-e29b-41d4-a716-446655440009', 'available', 'Mystery E2'),

-- Book 10: Project Hail Mary (3 copies)
('CPY-010-001', '550e8400-e29b-41d4-a716-446655440010', 'available', 'Science Fiction B2'),
('CPY-010-002', '550e8400-e29b-41d4-a716-446655440010', 'available', 'Science Fiction B2'),
('CPY-010-003', '550e8400-e29b-41d4-a716-446655440010', 'available', 'Science Fiction B2'),

-- Book 11: The House in the Cerulean Sea (5 copies)
('CPY-011-001', '550e8400-e29b-41d4-a716-446655440011', 'available', 'Fantasy F1'),
('CPY-011-002', '550e8400-e29b-41d4-a716-446655440011', 'available', 'Fantasy F1'),
('CPY-011-003', '550e8400-e29b-41d4-a716-446655440011', 'available', 'Fantasy F1'),
('CPY-011-004', '550e8400-e29b-41d4-a716-446655440011', 'available', 'Fantasy F1'),
('CPY-011-005', '550e8400-e29b-41d4-a716-446655440011', 'available', 'Fantasy F1'),

-- Book 12: Mexican Gothic (2 copies)
('CPY-012-001', '550e8400-e29b-41d4-a716-446655440012', 'available', 'Horror G1'),
('CPY-012-002', '550e8400-e29b-41d4-a716-446655440012', 'available', 'Horror G1'),

-- Book 13: The Priory of the Orange Tree (1 copy)
('CPY-013-001', '550e8400-e29b-41d4-a716-446655440013', 'available', 'Fantasy F1'),

-- Book 14: Normal People (4 copies)
('CPY-014-001', '550e8400-e29b-41d4-a716-446655440014', 'available', 'Fiction Section A4'),
('CPY-014-002', '550e8400-e29b-41d4-a716-446655440014', 'available', 'Fiction Section A4'),
('CPY-014-003', '550e8400-e29b-41d4-a716-446655440014', 'available', 'Fiction Section A4'),
('CPY-014-004', '550e8400-e29b-41d4-a716-446655440014', 'available', 'Fiction Section A4'),

-- Book 15: The Invisible Life of Addie LaRue (3 copies)
('CPY-015-001', '550e8400-e29b-41d4-a716-446655440015', 'available', 'Fantasy F2'),
('CPY-015-002', '550e8400-e29b-41d4-a716-446655440015', 'available', 'Fantasy F2'),
('CPY-015-003', '550e8400-e29b-41d4-a716-446655440015', 'available', 'Fantasy F2'),

-- Book 16: Hamnet (2 copies)
('CPY-016-001', '550e8400-e29b-41d4-a716-446655440016', 'available', 'Historical Fiction H1'),
('CPY-016-002', '550e8400-e29b-41d4-a716-446655440016', 'available', 'Historical Fiction H1'),

-- Book 17: The Sanatorium (1 copy)
('CPY-017-001', '550e8400-e29b-41d4-a716-446655440017', 'available', 'Thriller E1'),

-- Book 18: Pachinko (5 copies)
('CPY-018-001', '550e8400-e29b-41d4-a716-446655440018', 'available', 'Historical Fiction H1'),
('CPY-018-002', '550e8400-e29b-41d4-a716-446655440018', 'available', 'Historical Fiction H1'),
('CPY-018-003', '550e8400-e29b-41d4-a716-446655440018', 'available', 'Historical Fiction H1'),
('CPY-018-004', '550e8400-e29b-41d4-a716-446655440018', 'available', 'Historical Fiction H1'),
('CPY-018-005', '550e8400-e29b-41d4-a716-446655440018', 'available', 'Historical Fiction H1'),

-- Book 19: The Poppy War (3 copies)
('CPY-019-001', '550e8400-e29b-41d4-a716-446655440019', 'available', 'Fantasy F2'),
('CPY-019-002', '550e8400-e29b-41d4-a716-446655440019', 'available', 'Fantasy F2'),
('CPY-019-003', '550e8400-e29b-41d4-a716-446655440019', 'available', 'Fantasy F2'),

-- Book 20: Americanah (2 copies)
('CPY-020-001', '550e8400-e29b-41d4-a716-446655440020', 'available', 'Fiction Section A5'),
('CPY-020-002', '550e8400-e29b-41d4-a716-446655440020', 'available', 'Fiction Section A5'),

-- Book 21: The Water Will Come (1 copy)
('CPY-021-001', '550e8400-e29b-41d4-a716-446655440021', 'available', 'Science I1'),

-- Book 22: Sapiens (4 copies)
('CPY-022-001', '550e8400-e29b-41d4-a716-446655440022', 'available', 'Science I1'),
('CPY-022-002', '550e8400-e29b-41d4-a716-446655440022', 'available', 'Science I1'),
('CPY-022-003', '550e8400-e29b-41d4-a716-446655440022', 'available', 'Science I1'),
('CPY-022-004', '550e8400-e29b-41d4-a716-446655440022', 'available', 'Science I1'),

-- Book 23: The Righteous Mind (3 copies)
('CPY-023-001', '550e8400-e29b-41d4-a716-446655440023', 'available', 'Psychology J1'),
('CPY-023-002', '550e8400-e29b-41d4-a716-446655440023', 'available', 'Psychology J1'),
('CPY-023-003', '550e8400-e29b-41d4-a716-446655440023', 'available', 'Psychology J1'),

-- Book 24: Braiding Sweetgrass (2 copies)
('CPY-024-001', '550e8400-e29b-41d4-a716-446655440024', 'available', 'Nature K1'),
('CPY-024-002', '550e8400-e29b-41d4-a716-446655440024', 'available', 'Nature K1'),

-- Book 25: The Body Keeps the Score (5 copies)
('CPY-025-001', '550e8400-e29b-41d4-a716-446655440025', 'available', 'Psychology J1'),
('CPY-025-002', '550e8400-e29b-41d4-a716-446655440025', 'available', 'Psychology J1'),
('CPY-025-003', '550e8400-e29b-41d4-a716-446655440025', 'available', 'Psychology J1'),
('CPY-025-004', '550e8400-e29b-41d4-a716-446655440025', 'available', 'Psychology J1'),
('CPY-025-005', '550e8400-e29b-41d4-a716-446655440025', 'available', 'Psychology J1'),

-- Book 26: Dune (1 copy)
('CPY-026-001', '550e8400-e29b-41d4-a716-446655440026', 'available', 'Science Fiction B1'),

-- Book 27: The Name of the Wind (3 copies)
('CPY-027-001', '550e8400-e29b-41d4-a716-446655440027', 'available', 'Fantasy F3'),
('CPY-027-002', '550e8400-e29b-41d4-a716-446655440027', 'available', 'Fantasy F3'),
('CPY-027-003', '550e8400-e29b-41d4-a716-446655440027', 'available', 'Fantasy F3'),

-- Book 28: Station Eleven (4 copies)
('CPY-028-001', '550e8400-e29b-41d4-a716-446655440028', 'available', 'Science Fiction B3'),
('CPY-028-002', '550e8400-e29b-41d4-a716-446655440028', 'available', 'Science Fiction B3'),
('CPY-028-003', '550e8400-e29b-41d4-a716-446655440028', 'available', 'Science Fiction B3'),
('CPY-028-004', '550e8400-e29b-41d4-a716-446655440028', 'available', 'Science Fiction B3'),

-- Book 29: The Fifth Season (2 copies)
('CPY-029-001', '550e8400-e29b-41d4-a716-446655440029', 'available', 'Science Fiction B3'),
('CPY-029-002', '550e8400-e29b-41d4-a716-446655440029', 'available', 'Science Fiction B3'),

-- Book 30: Beloved (3 copies)
('CPY-030-001', '550e8400-e29b-41d4-a716-446655440030', 'available', 'Historical Fiction H2'),
('CPY-030-002', '550e8400-e29b-41d4-a716-446655440030', 'available', 'Historical Fiction H2'),
('CPY-030-003', '550e8400-e29b-41d4-a716-446655440030', 'available', 'Historical Fiction H2'),

-- Book 31: One Hundred Years of Solitude (1 copy)
('CPY-031-001', '550e8400-e29b-41d4-a716-446655440031', 'available', 'Literature L1'),

-- Book 32: The Alchemist (5 copies)
('CPY-032-001', '550e8400-e29b-41d4-a716-446655440032', 'available', 'Philosophy M1'),
('CPY-032-002', '550e8400-e29b-41d4-a716-446655440032', 'available', 'Philosophy M1'),
('CPY-032-003', '550e8400-e29b-41d4-a716-446655440032', 'available', 'Philosophy M1'),
('CPY-032-004', '550e8400-e29b-41d4-a716-446655440032', 'available', 'Philosophy M1'),
('CPY-032-005', '550e8400-e29b-41d4-a716-446655440032', 'available', 'Philosophy M1'),

-- Book 33: Persepolis (2 copies)
('CPY-033-001', '550e8400-e29b-41d4-a716-446655440033', 'available', 'Graphic Novels N1'),
('CPY-033-002', '550e8400-e29b-41d4-a716-446655440033', 'available', 'Graphic Novels N1'),

-- Book 34: The Handmaid's Tale (4 copies)
('CPY-034-001', '550e8400-e29b-41d4-a716-446655440034', 'available', 'Science Fiction B4'),
('CPY-034-002', '550e8400-e29b-41d4-a716-446655440034', 'available', 'Science Fiction B4'),
('CPY-034-003', '550e8400-e29b-41d4-a716-446655440034', 'available', 'Science Fiction B4'),
('CPY-034-004', '550e8400-e29b-41d4-a716-446655440034', 'available', 'Science Fiction B4'),

-- Book 35: Neuromancer (1 copy)
('CPY-035-001', '550e8400-e29b-41d4-a716-446655440035', 'available', 'Science Fiction B4'),

-- Book 36: The Joy Luck Club (3 copies)
('CPY-036-001', '550e8400-e29b-41d4-a716-446655440036', 'available', 'Fiction Section A6'),
('CPY-036-002', '550e8400-e29b-41d4-a716-446655440036', 'available', 'Fiction Section A6'),
('CPY-036-003', '550e8400-e29b-41d4-a716-446655440036', 'available', 'Fiction Section A6'),

-- Book 37: Wild (2 copies)
('CPY-037-001', '550e8400-e29b-41d4-a716-446655440037', 'available', 'Biography D2'),
('CPY-037-002', '550e8400-e29b-41d4-a716-446655440037', 'available', 'Biography D2'),

-- Book 38: The Kite Runner (5 copies)
('CPY-038-001', '550e8400-e29b-41d4-a716-446655440038', 'available', 'Historical Fiction H3'),
('CPY-038-002', '550e8400-e29b-41d4-a716-446655440038', 'available', 'Historical Fiction H3'),
('CPY-038-003', '550e8400-e29b-41d4-a716-446655440038', 'available', 'Historical Fiction H3'),
('CPY-038-004', '550e8400-e29b-41d4-a716-446655440038', 'available', 'Historical Fiction H3'),
('CPY-038-005', '550e8400-e29b-41d4-a716-446655440038', 'available', 'Historical Fiction H3'),

-- Book 39: Life of Pi (3 copies)
('CPY-039-001', '550e8400-e29b-41d4-a716-446655440039', 'available', 'Adventure O1'),
('CPY-039-002', '550e8400-e29b-41d4-a716-446655440039', 'available', 'Adventure O1'),
('CPY-039-003', '550e8400-e29b-41d4-a716-446655440039', 'available', 'Adventure O1'),

-- Book 40: The God of Small Things (4 copies)
('CPY-040-001', '550e8400-e29b-41d4-a716-446655440040', 'available', 'Literature L2'),
('CPY-040-002', '550e8400-e29b-41d4-a716-446655440040', 'available', 'Literature L2'),
('CPY-040-003', '550e8400-e29b-41d4-a716-446655440040', 'available', 'Literature L2'),
('CPY-040-004', '550e8400-e29b-41d4-a716-446655440040', 'available', 'Literature L2');