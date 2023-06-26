import React, { useState } from "react";
import { Navbar, Nav, NavDropdown, Button, Form } from "react-bootstrap";
// import gklogo from "gklogo.png";
import { BiCart } from "react-icons/bi";
import { BsPerson } from "react-icons/bs";
import { Link } from "react-router-dom";

const Header = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleChange = (value) => {
    setSearchInput(value);
    // fetchData(value);
  };

  // useEffect(() => {
  //   if (selectedCategory !== "") {
  //     // Fetch products based on selected category
  //     fetchProducts(selectedCategory);
  //   }
  // }, [selectedCategory]);

  // const fetchProducts = (category) => {
  //   // Create form data
  //   const formData = new FormData();
  //   formData.append("category", category);

  //   // Make API request to fetch products based on category
  //   // Replace the placeholder URL with your backend API endpoint
  //   fetch("http://127.0.0.1:8000/products/<category>", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => response.json())
  //     .then((data) => setProducts(data))
  //     .catch((error) => console.log(error));
  // };

  // const handleCategorySelect = (category) => {
  //   setSelectedCategory(category);
  // };

  return (
    <Navbar bg="white" expand="lg">
      <Navbar.Brand href="/">
        <img
          src="./assets/gklogo.png"
          width="60"
          height="50"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbarScroll" />
      <Navbar.Collapse id="navbarScroll">
        <Nav
          className="me-auto my-2 my-lg-0"
          style={{ maxHeight: "100px" }}
          navbarScroll
        >
          <NavDropdown title="Category" id="navbarScrollingDropdown">
            <NavDropdown.Item>
              <Link
                className="link-dark text-decoration-none"
                to={{
                  pathname: "/buyproduct",
                  search: "?category=Category_1",
                }}
              >
                Vegetables
              </Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link
                className="link-dark text-decoration-none"
                to={{
                  pathname: "/buyproduct",
                  search: "?category=Category_3",
                }}
              >
                Fruits
              </Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link
                className="link-dark text-decoration-none"
                to={{
                  pathname: "/buyproduct",
                  search: "?category=Category_2",
                }}
              >
                Bakery
              </Link>
            </NavDropdown.Item>
            <NavDropdown.Item>
              <Link
                className="link-dark text-decoration-none"
                to={{
                  pathname: "/buyproduct",
                  search: "?category=Category_4",
                }}
              >
                Meat
              </Link>
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="/buyproduct">Products</Nav.Link>
          {/* <Nav.Link href="/buyproduct">Offers</Nav.Link> */}
        </Nav>
        <div>
          <div>
            {searchResults.map((product) => (
              <div>
                <img
                  className="products"
                  src={"./assets/" + product.name + ".jpeg"}
                  alt={product.name}
                />
                <p>{product.name}</p>
              </div>
            ))}
          </div>
          <Form className="d-flex">
            <Form.Control
              value={searchInput}
              onChange={(e) => handleChange(e.target.value)}
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success">
              <Link
                className="link-dark text-decoration-none"
                to={{
                  pathname: "/buyproduct",
                  search: `?searchValue=${searchInput}`,
                }}
              >
                Search
              </Link>
            </Button>

            {/* <Button variant="outline-success">Search</Button> */}
          </Form>
        </div>
        <Nav.Link href="/Cart">
          <BiCart size={42} color="#198754" />
        </Nav.Link>
        <NavDropdown
          title={<BsPerson size={34} color="#198754" />}
          id="navbarScrollingDropdown"
        >
          <NavDropdown.Item href="/register">Register</NavDropdown.Item>
          <NavDropdown.Item href="/login">Login</NavDropdown.Item>
        </NavDropdown>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
