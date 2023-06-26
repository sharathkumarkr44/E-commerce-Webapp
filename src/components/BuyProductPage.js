import React, { useState, useEffect } from "react";
import "./BuyProductPage.css";
import ReactDOM from "react-dom";
import { useLocation } from "react-router-dom";
import ChatWindow from "./ChatWindow";
import ChatDialogBox from "./ChatDialogBox";

const BuyProductPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [products, setProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const category = searchParams.get("category");
  const [showChat, setShowChat] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const searchValue = searchParams.get("searchValue");

  let url = "http://127.0.0.1:8000/addproduct";
  if (category !== null) {
    url += `?category=${category}`;
  }
  if (searchValue !== null) {
    url += `?searchValue=${searchValue}`;
  }

  useEffect(() => {
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // Mark products as sold if count is 0
        const updatedProducts = data.map((product) => {
          if (product.count === 0) {
            return { ...product, isSold: true };
          } else if (product.discounted_price !== null) {
            return { ...product, isSold: false, hasDiscount: true };
          } else {
            return product;
          }
        });
        setProducts(updatedProducts);
        setSortedProducts(updatedProducts);
      })
      .catch((error) => console.log(error));

    const orderPlacedStatus = localStorage.getItem("orderPlaced");
    if (orderPlacedStatus === "true") {
      setOrderPlaced(true);
      localStorage.removeItem("orderPlaced");
    }
  }, [category,searchValue]);

  const handleAddToCart = (product, quantity) => {
    const existingCartItemIndex = cart.findIndex(
      (item) => item.id === product.id
    );

    if (existingCartItemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[existingCartItemIndex].quantity += quantity;
      setCart(updatedCart);
      localStorage.setItem("itemsInCart", JSON.stringify(updatedCart));
    } else {
      const cartItem = { ...product, quantity };
      setCart([...cart, cartItem]);
      localStorage.setItem("itemsInCart", JSON.stringify([...cart, cartItem]));
    }
  };

  if (sortBy && sortBy === "PRICE_HIGH_TO_LOW") {
    sortedProducts.sort(
      (a, b) => parseFloat(b["price"]) - parseFloat(a["price"])
    );
  } else if (sortBy && sortBy === "PRICE_LOW_TO_HIGH") {
    sortedProducts.sort(
      (a, b) => parseFloat(a["price"]) - parseFloat(b["price"])
    );
  } else if (sortBy && sortBy === "NAME_Z_TO_A") {
    sortedProducts.sort((a, b) => a.name.localcompare(b.name));
  } else if (sortBy && sortBy === "NAME_A_TO_Z") {
    sortedProducts.sort((a, b) => b["name"] - a["name"]);
  }

  const openChatDialog = (productId) => {
    const selectedProduct = products.find((product) => product.id === productId);
    setSelectedProduct(selectedProduct);
    setShowChatDialog(true); // Show the chat dialog box
  };
  
  

  const closeChatDialog = () => {
    setSelectedProduct(null);
    setShowChatDialog(false);
  };

  const handleSendMessage = (message) => {
    // Send the message to the seller
    // You can implement the logic here to send the message to the backend or perform any other actions

    console.log("Message:", message);
  };

  const toggleChat = () => {
    const newWindow = window.open("", "_blank");
    newWindow.document.write("<html><body><div id='chat-root'></div></body></html>");
    newWindow.document.close();

    const chatContainer = newWindow.document.getElementById("chat-root");
    ReactDOM.render(<ChatWindow />, chatContainer);
  };

  return (
    <div className="d-flex">
      <div className="product-sidebar border">
        <div className="product-sort">
          <h4>Sort</h4>
          <label>
            <input
              type="radio"
              name="sort"
              onChange={() => setSortBy("PRICE_HIGH_TO_LOW")}
              checked={sortBy && sortBy === "PRICE_HIGH_TO_LOW"}
            />
            Price - High to Low
          </label>
          <br />
          <label>
            <input
              type="radio"
              name="sort"
              onChange={() => setSortBy("PRICE_LOW_TO_HIGH")}
              checked={sortBy && sortBy === "PRICE_LOW_TO_HIGH"}
            />
            Price - Low to High
          </label>
        </div>
      </div>

      <div className="container">
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className={`product ${product.isSold ? "sold" : ""}`}
          >
            <img
              className="products"
              src={"./assets/" + product.name + ".jpeg"}
              alt={product.name}
            />
            <div className="product-name">{product.name}</div>
            <div className="product-price">€ {product.discounted_price}</div>

            {product.count === 0 && <div className="sold-out">Sold Out</div>}
            {product.hasDiscount ? (
              <div className="product-offer">
                <span className="offer-badge">Offer!</span>
                <div className="offer-price">
                  <span className="original-price">€ {product.price}</span>
                </div>
              </div>
            ) : (
              <div className="product-offer">
                <span className="offer-badge">Offer!</span>
                <div className="offer-price">
                  <span className="original-price">€ {product.price}</span>
                </div>
              </div>
            )}

            {product.count > 0 && (
              <div>
                <input
                  type="number"
                  min="1"
                  defaultValue="0"
                  id={product.id}
                  className="form-control input-number-cart"
                />
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleAddToCart(
                      product,
                      parseInt(
                        document.getElementById(product.id).value
                      )
                    )
                  }
                >
                  Add to Cart
                </button>
              </div>
            )}

            <button
              className="btn btn-secondary chat-button-product"
              onClick={() => openChatDialog(product.id)}
            >
              Chat with Seller
            </button>
          </div>
        ))}
      </div>

      <button className="chat-button" onClick={toggleChat}>
        {showChat ? "Close Chat" : "Open Chat"}
      </button>

      {showChat && <ChatWindow />}

      {showChatDialog && (
        <ChatDialogBox
          productId={selectedProduct ? selectedProduct.id : ""}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default BuyProductPage;