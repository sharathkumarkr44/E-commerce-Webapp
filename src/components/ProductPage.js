import React, { Component } from 'react';
import './ProductPage.css';
import ReactDOM from 'react-dom';
import ChatWindow from './ChatWindow';

class AddProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      category: '',
      name: '',
      description: '',
      count: '',
      price: '',
      offer: '',
      offerDuration: '',
      showChat: false,
    };
  }

  handleCategoryChange = (event) => {
    this.setState({ category: event.target.value });
  };

  handleProductChange = (event) => {
    this.setState({ name: event.target.value });
  };

  handleDescriptionChange = (event) => {
    this.setState({ description: event.target.value });
  };

  handleCountChange = (event) => {
    this.setState({ count: event.target.value });
  };

  handlePriceChange = (event) => {
    this.setState({ price: event.target.value });
  };

  handleOfferChange = (event) => {
    this.setState({ offer: event.target.value });
  };

  handleOfferDurationChange = (event) => {
    this.setState({ offerDuration: event.target.value });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const { category, name, description, count, price, offer, offerDuration } = this.state;

    const priceInt = parseInt(price, 10);

    if (isNaN(priceInt) || priceInt <= 0 || priceInt % 1 !== 0) {
      console.error('Error: Invalid price');
      return;
    }

    const offerInt = parseInt(offer, 10);

    if (isNaN(offerInt) || offerInt < 0 || offerInt > 100 || offerInt % 1 !== 0) {
      console.error('Error: Invalid offer');
      return;
    }

    const offerDurationInt = parseInt(offerDuration, 10);

    if (isNaN(offerDurationInt) || offerDurationInt <= 0 || offerDurationInt % 1 !== 0) {
      console.error('Error: Invalid offer duration');
      return;
    }

    const userId = localStorage.getItem('user_id'); // Retrieve userId from session storage

    if (!userId) {
      console.error('Error: User ID not found');
      return;
    }

    const formData = {
      userId,
      category,
      name,
      description,
      price: priceInt,
      count,
      offer: offerInt,
      offerDuration: offerDurationInt,
    };

    console.log('Form Data:', formData); // Log the form data

    try {
      const response = await fetch('http://localhost:8000/addproduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Handle the JSON response data here
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  getProductOptions = () => {
    const { category } = this.state;
    switch (category) {
      case 'Category 1':
        return [
          'Tomatoes',
          'Beans',
          'Cucumber',
          'Ladies Finger',
          'Potatoes',
          'Onion',
          'Ingwer',
          'Carrot',
          'Spinach',
        ];
      case 'Category 2':
        return [
          'Bread',
          'Bun',
          'Croissant',
          'Baguette',
          'Donuts',
          'Cup Cakes',
          'Pastries',
        ];
      case 'Category 3':
        return [
          'Banana',
          'Strawberry',
          'Mangoes',
          'Orange',
          'Apple',
          'Litchi',
          'Berries',
          'Grapes',
        ];
      case 'Category 4':
        return ['Chicken', 'Beef', 'Mutton', 'Pork', 'Salmon', 'Duck', 'Turkey'];
      default:
        return [];
    }
  };

  getCountOptions = () => {
    return Array.from({ length: 10 }, (_, i) => String(i + 1));
  };

  toggleChat = () => {
    const newWindow = window.open('', '_blank');
    newWindow.document.write('<html><body><div id="chat-root"></div></body></html>');
    newWindow.document.close();
  
    const chatContainer = newWindow.document.getElementById('chat-root');
    ReactDOM.render(<ChatWindow />, chatContainer);
  };
  

  render() {
    const { category, name, description, count, price, offer, offerDuration, showChat } = this.state;

    return (
      <div className="product-page">
        <h1>Add Product</h1>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select id="category" value={category} onChange={this.handleCategoryChange}>
              <option value="">Select a category</option>
              <option value="Category 1">Fresh Vegetables</option>
              <option value="Category 2">Bakery Products</option>
              <option value="Category 3">Fruits</option>
              <option value="Category 4">Meat</option>
            </select>
          </div>

          {category && (
            <div className="form-group">
              <label htmlFor="product">Product:</label>
              <select id="product" value={name} onChange={this.handleProductChange}>
                <option value="">Select a product</option>
                {this.getProductOptions().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="quantity">Count:</label>
            <select id="quantity" value={count} onChange={this.handleCountChange}>
              <option value="">Select a count</option>
              {this.getCountOptions().map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={this.handlePriceChange}
              placeholder="Enter price"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="offer">Offer (%):</label>
            <input
              type="number"
              id="offer"
              value={offer}
              onChange={this.handleOfferChange}
              placeholder="Enter offer"
              min="0"
              max="100"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="offer-duration">Offer Duration (hours):</label>
            <input
              type="number"
              id="offer-duration"
              value={offerDuration}
              onChange={this.handleOfferDurationChange}
              placeholder="Enter offer duration"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Product Description:</label>
            <textarea id="description" value={description} onChange={this.handleDescriptionChange} />
          </div>

          <button type="submit">Submit</button>
          {/* Chat Button */}
          <button className="chat-button" onClick={this.toggleChat}>
            {showChat ? 'Close Chat' : 'Open Chat'}
          </button>

          {/* Chat Component */}
          {/* Render the chat window component conditionally based on showChat state */}
          {showChat && <ChatWindow />}
        </form>
      </div>
    );
  }
}

export default AddProduct;