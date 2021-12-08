npm init -y

npm install tailwincss

 "scripts": {
    "build-css":"tailwindcss build src/style.css -o public/style.css"
  },

npm run build-css



History Page (Has Search & Add Button)
Stats Page Total, Old and New Testament

Record Page - Allows entry of a book, start chapter and end chapter & Notes??

//npm install @tailwindcss/forms

Controller:
- ReadingRecord - Create Method, Update Method, Delete, List (Paged)
- Stats - Read (Pipeline)

- Review & Notes of Books??


Books of the bible - https://holyword.church/miscellaneous-resources/how-many-words-in-each-book-of-the-bible/

record:

{
  date : 23/09/2002,
  book : genesis,
  chapters: [ 1, 2, 3, 4],
  user: userId
}

req.body has fromChapter & toChapter:

need a for loop:
chapters.add(i)



How much of a single book is complete:
  select * from records from user group by book where book is genesis & unique chapter (count chapters & compare to full count)

How much of every book is complete:
  select * from records from user group by book & unique chapter - gives all books and all chapters read

  above - where testament is OT or NT


How much this month:
  select * from records where user count chapters.size

ToDo: Create a table of all books & how much is complete??


December ToDo:
- **Record Page**
  - Change View & Edit Record to Single button (done)
  - Add edit record functionality (done)
  - Add delete record functionality - popup (done)
  - Add ability to bookmark records
  - Add Pagination (done)

- **bookmarks** (future)
  - Show page of just records & their notes 

- **Stats**
  - Get stats page working
  - Add stats graph

- **Dashboard**
  - Change stats page to dashboard
  - Make just a list of buttons (my records, my stats, add records) ...


- **Improvements**
  - Make record deletes done with Ajax   