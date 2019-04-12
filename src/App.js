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
        if (data.status !== "success" && this.state.limit > 0) {
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
            if (data.status !== "success" && this.state.limit > 0) {
                this.setState({limit: this.state.limit -1});
                this.onDelete(id);
            } else if (this.state.limit > 0) {
                this.setState({success: true});
                this.getBooks();
            }
        });
  }
////Fungerar inte 
  onEditSubmit(title, author, originalTitle) {
    let books = this.getBooks();
    books = books.map(book => {
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
