import React, { useState, useEffect } from "react";
import "./BuyProductPage.css";
import { useLocation } from "react-router-dom";

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

  let url = "http://127.0.0.1:8000/addproduct";
  if (category !== null) {
    url += `?category=${category}`;
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
  }, [category]);

  // useEffect(() => {
  //   const count = cart.reduce((total, item) => total + item.quantity, 0);
  //   setCartItemCount(count);
  // }, [cart]);

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

    // setShowCartPopup(false); // Show the cart popup
  };

  // const handlePlaceOrder = () => {
  //   if (cart.length > 0 && address && city && state && pincode) {
  //     const items = cart.map((item) => ({
  //       product_name: item.name,
  //       quantity: item.quantity,
  //     }));

  //     const orderData = {
  //       address: address,
  //       city: city,
  //       state: state,
  //       pincode: pincode,
  //       items: items,
  //     };

  //     fetch("http://127.0.0.1:8000/placeorder", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(orderData),
  //     })
  //       .then((response) => response.json())
  //       .then((data) => {
  //         console.log(data.message); // Success message from the server
  //         setCart([]); // Clear the cart
  //         setAddress(""); // Clear the address field
  //         setCity(""); // Clear the city field
  //         setState(""); // Clear the state field
  //         setPincode(""); // Clear the pincode field
  //         localStorage.setItem("orderPlaced", "true"); // Set order placed status in local storage
  //         window.location.reload(); // Refresh the page
  //       })
  //       .catch((error) => console.log(error));
  //   }
  // };

  // const calculateTotalCartValue = () => {
  //   const total = cart.reduce(
  //     (accumulator, item) => accumulator + item.price * item.quantity,
  //     0
  //   );
  //   return total.toFixed(2);
  // };

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

  console.log(sortedProducts);

  return (
    <div className="d-flex">
      {/* Cart Icon */}
      {/* <div className="cart-icon" onClick={() => setShowCartPopup(true)}>
        <i className="fas fa-shopping-cart"></i>
        {cartItemCount > 0 && (
          <span className="cart-item-count">{cartItemCount}</span>
        )}
      </div> */}
      <div className="product-sidebar border">
        <div className="product-sort">
          <h4>Sort</h4>
          <label>
            <input
              type="radio"
              name="sort"
              onChange={() => setSortBy("PRICE_HIGH_TO_LOW")}
              checked={sortBy && sortBy === "PRICE_HIGH_TO_LOW"}
            ></input>{" "}
            Price - High to Low
          </label>
          <br></br>
          <label>
            <input
              type="radio"
              name="sort"
              onChange={() => setSortBy("PRICE_LOW_TO_HIGH")}
              checked={sortBy && sortBy === "PRICE_LOW_TO_HIGH"}
            ></input>{" "}
            Price - Low to High
          </label>
          {/* <br></br>
          <label>
            <input
              type="radio"
              name="sort"
              onChange={() => setSortBy("NAME_A_TO_Z")}
              checked={sortBy && sortBy === "NAME_A_TO_Z"}
            ></input>{" "}
            Name - A to Z
          </label>
          <br></br>
          <label>
            <input
              type="radio"
              name="sort"
              onChange={() => setSortBy("NAME_Z_TO_A")}
              checked={sortBy && sortBy === "NAME_Z_TO_A"}
            ></input>{" "}
            Name - Z to A
          </label> */}
        </div>
      </div>

      {/* Cart Popup */}
      {/* {showCartPopup && (
        <div className="cart-popup">
          <h2>Cart</h2>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div>{item.name}</div>
                  <div>Quantity: {item.quantity}</div>
                </div>
              ))}
              <p>Total: € {calculateTotalCartValue()}</p>
              <div className="cart-address">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" onClick={handlePlaceOrder}>
                Place Order
              </button>
            </>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>
      )} */}

      {/* Order Placed Message */}
      {/* {orderPlaced && (
        <div className="order-placed">
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your purchase.</p>
        </div>
      )} */}

      <div className="container">
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className={`product ${product.isSold ? "sold" : ""}`}
          >
            <img src="assets/apple.jpeg" alt={product.name} />
            {/* <img src={`/assets/${product.image}`} alt={product.name} /> */}
            <div className="product-name">{product.name}</div>
            <div className="product-price">€ {product.discounted_price}</div>
            {/* <div className="product-description">{product.description}</div> */}
            {/* <div className="product-category">{product.category}</div> */}
            {product.count === 0 && <div className="sold-out">Sold Out</div>}
            {product.hasDiscount ? (
              <div className="product-offer">
                <span className="offer-badge">Offer!</span>
                <div className="offer-price">
                  <span className="original-price">€ {product.price}</span>
                  {/* <span className="discounted-price">{product.price}</span> */}
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
              <>
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
                      parseInt(document.getElementById(product.id).value)
                    )
                  }
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      {/* Product List */}
    </div>
  );
};

export default BuyProductPage;