import React, { Component } from 'react';
import './App.css';

import BookItem from './component/BookItem';
import AddBook from './component/AddBook.js';


const apiKey = localStorage.getItem('firstKey');

const getFirstKey = () => {
  console.log('blurp', apiKey);
  if (apiKey) {
    return apiKey
  } else {
    fetch(`https://www.forverkliga.se/JavaScript/api/crud.php?requestKey`)
      .then(response => response.json())
      .then(data => localStorage.setItem('firstKey', data.key))
  }
};



class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      books: [],
      limit: 10,
      success: false
    };

    //this.onDelete = this.onDelete.bind(this);
    //this.onAdd = this.onAdd.bind(this);
    //this.onEditSubmit = this.onEditSubmit.bind(this);
  }


  componentDidMount() {

    getFirstKey();
    this.getBooks();
  console.log(localStorage.getItem('firstKey'));
  }

  getBooks =() => {
    fetch(`https://www.forverkliga.se/JavaScript/api/crud.php?op=select&key=${apiKey}`)
        .then(response => response.json())
        .then((data) => {
            if (data.status !== "success" && this.state.limit > 0) {
                this.setState({limit: this.state.limit - 1});
                this.getBooks();
            } else if (this.state.limit > 0 ) {
                this.setState({success: true});
                this.setState({books: data.data});
            }
        });

  }

  onAdd = (title, author) => {
    if (this.state.success) {
        this.setState({success: false, limit: 10});
    }

    fetch(`https://www.forverkliga.se/JavaScript/api/crud.php?op=insert&key=${apiKey}&title=${title}&author=${author}`)
      .then(response => response.json())
      .then(data => {
        // Här saknas ett villkor för när requestet lyckats där ni med fördel
        // kan lägg till boken direkt i statet istället för att hämta om hela listan igen
        // Skulle kunna se ut såhär
        if (data.status === "success") {
          this.setState({
            books: [...this.state.books, { id: data.id, title, author }]
          })
        } else if (data.status !== "success" && this.state.limit > 0) {
          this.onAdd(title, author);
          this.setState({ limit: this.state.limit - 1 });
        }else if (this.state.limit > 0) {
          this.setState({success: true});
          this.getBooks();

        }
      })
  }

  onDelete=(id)=> {
    if (this.state.success) {
        this.setState({success: false, limit: 10});
    }


    fetch(`https://www.forverkliga.se/JavaScript/api/crud.php?op=delete&key=${apiKey}&id=${id}`)
        .then(resp => resp.json())
        .then((data) => {
          // Här saknas ett villkor för när requestet lyckats där ni med fördel
          // kan ta bort boken direkt i statet istället för att hämta om hela listan igen
          // Skulle kunna se ut såhär
            if (data.status === "success") {
              this.setState({
                books: this.state.books.filter(book => book.id !== id)
              })
            } else if (data.status !== "success" && this.state.limit > 0) {
                this.setState({limit: this.state.limit -1});
                this.onDelete(id);
            } else if (this.state.limit > 0) {
                this.setState({success: true});
                this.getBooks();
            }
        });
  }
////Fungerar inte --- Eftersom den här funktionen inte hade bundit kontexten för this till klassen
  // Genom att konvertera den till en arrow-function åstadkommer vi detta
  // De andra metoderna i klassen är redan arrow-functions
  onEditSubmit = (title, author, originalTitle) => {
    // getBooks returnerar ingenting därför är books undefined
    let books = this.getBooks();
    // Eftersom books är undefined och inte en array så blir det fel när en funktion som inte finns försöker köras
    console.log(this.state.books)
    books = this.state.books.map(book => {
      if (book.title === originalTitle) {
        book.title = title;
        book.author = author;
      }
      return book;
    });
    this.setState({ books });
  }

  render() {
    return (
      <div className="App">
        <h1>Book Manager</h1>
        <AddBook
          onAdd={this.onAdd}
        />
        {this.state.books.map(book => {
          return (
            <BookItem
              key={book.id}
              {...book}
              onDelete={this.onDelete}
              onEditSubmit={this.onEditSubmit}
            />
          );
        })
        }
      </div>
    );
  }
}

export default App;
