-- Script: populate-sample-books-modified
-- Description: Insert 20 sample books with complete data (modified for auto-increment ID)

INSERT INTO books (title, author, isbn, genre, publication_year, description) VALUES
('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 'Fiction', 1960, 'A gripping tale of racial injustice and childhood innocence in the American South.'),
('1984', 'George Orwell', '978-0-452-28423-4', 'Dystopian Fiction', 1949, 'A dystopian social science fiction novel about totalitarian control.'),
('Pride and Prejudice', 'Jane Austen', '978-0-14-143951-8', 'Romance', 1813, 'A romantic novel about manners, marriage, and society in Georgian England.'),
('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 'Fiction', 1925, 'A critique of the American Dream set in the Jazz Age.'),
('The Catcher in the Rye', 'J.D. Salinger', '978-0-316-76948-0', 'Coming-of-age', 1951, 'A controversial novel about teenage rebellion and alienation.'),
('Lord of the Flies', 'William Golding', '978-0-571-05686-2', 'Adventure', 1954, 'A story about British boys stranded on an uninhabited island.'),
('The Lord of the Rings', 'J.R.R. Tolkien', '978-0-544-00341-5', 'Fantasy', 1954, 'An epic high-fantasy novel set in Middle-earth.'),
('Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', '978-0-439-70818-8', 'Fantasy', 1997, 'A young wizard discovers his magical heritage on his 11th birthday.'),
('The Chronicles of Narnia', 'C.S. Lewis', '978-0-06-023481-4', 'Fantasy', 1950, 'A series of fantasy novels set in the magical land of Narnia.'),
('Brave New World', 'Aldous Huxley', '978-0-06-085052-4', 'Science Fiction', 1932, 'A dystopian novel about a futuristic society obsessed with technology and pleasure.'),
('The Hobbit', 'J.R.R. Tolkien', '978-0-547-92822-7', 'Fantasy', 1937, 'The adventures of Bilbo Baggins, a hobbit who joins a quest for treasure.'),
('Fahrenheit 451', 'Ray Bradbury', '978-1-4516-7331-9', 'Science Fiction', 1953, 'A dystopian novel about a future society where books are banned and burned.'),
('Jane Eyre', 'Charlotte Brontë', '978-0-14-144114-6', 'Gothic Romance', 1847, 'The story of an orphaned girl who becomes a governess and finds love.'),
('Wuthering Heights', 'Emily Brontë', '978-0-14-143955-6', 'Gothic Romance', 1847, 'A tale of passion and revenge set on the Yorkshire moors.'),
('The Odyssey', 'Homer', '978-0-14-026886-7', 'Epic Poetry', -800, 'An ancient Greek epic poem about Odysseus''s journey home after the Trojan War.'),
('Crime and Punishment', 'Fyodor Dostoevsky', '978-0-14-044913-6', 'Psychological Fiction', 1866, 'A psychological novel about guilt, redemption, and moral responsibility.'),
('War and Peace', 'Leo Tolstoy', '978-0-14-044793-4', 'Historical Fiction', 1869, 'An epic novel chronicling the French invasion of Russia.'),
('Anna Karenina', 'Leo Tolstoy', '978-0-14-303500-6', 'Literary Fiction', 1878, 'A complex novel about love, society, and human nature in 19th-century Russia.'),
('The Brothers Karamazov', 'Fyodor Dostoevsky', '978-0-14-044924-2', 'Philosophical Fiction', 1880, 'A philosophical novel exploring faith, doubt, and morality through a family tragedy.'),
('One Hundred Years of Solitude', 'Gabriel García Márquez', '978-0-06-088328-8', 'Magical Realism', 1967, 'A multi-generational saga chronicling the Buendía family in the fictional town of Macondo.');
