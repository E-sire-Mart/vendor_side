import { notification, Modal } from "antd";
import MDAvatar from "components/MDAvatar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useEffect, useState } from "react";
import ProductService from "services/product-service";
export default function data(searchText) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProduct1, setSelectedProduct1] = useState(null);
  const [detailsProduct, setDetailsProduct] = useState(null);
  const API_URL = process.env.REACT_APP_SERVER_URL;

    // console.log("----dfdfdfdfd-------", API_URL)

  const fetchProducts = async () => {
    try {
      const response = await ProductService.getAll(searchText); // Pass searchText here
      console.log("response", response);
      setProducts(response?.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };



  const deleteProducts = async (product) => {
    try {
      await ProductService.delete(product._id);
      notification.success({
        message: "Deleted successfully",
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      notification.error({ message: "Delete failed" });
    }
  };


  useEffect(() => {
    fetchProducts(searchText);
  }, [searchText]);

  const handleOpenUpdateProductModal = (product) => {
    setSelectedProduct(product);
  };

  const handleDiscountModal = (product) => {
    setSelectedProduct1(product);
  };

  const handleCloseUpdateProductModal = () => {
    setSelectedProduct(null);
    fetchProducts(); // Fetch products again after closing the modal
  };

  const handleCloseDiscountModal = () => {
    setSelectedProduct1(null);
    fetchProducts();
  };

  const handleOpenDetails = (product) => setDetailsProduct(product);
  const handleCloseDetails = () => setDetailsProduct(null);

  const Product = ({ image, name, description, discountPercent, _id, fullProduct }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1} style={{ position: 'relative', paddingLeft: '5px' }}>
      <span onClick={() => handleOpenDetails(fullProduct)} style={{ cursor: 'pointer' }}>
        <MDAvatar src={API_URL + image[0]} name={name} size="lg" />
      </span>
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption" style={{ width: '300px', overflow: 'hidden' }}>{description.substring(0, 80)}...</MDTypography>
      </MDBox>
      {discountPercent > 0 ?
        <div
          style={{
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            backgroundColor: '#49a3f1',
            fontSize: '12px',
            color: '#fff',
            fontWeight: 'bold',
            padding: '5px',
            borderRadius: '5px'
          }}
        >
          {discountPercent}%
        </div>
        : null
      }
    </MDBox>
  );

  return {

    columns: [
      { Header: "product", accessor: "product", width: "10%", align: "left" },
      { Header: "price", accessor: "price", align: "left" },
      { Header: "quantity", accessor: "quantity", align: "center" },
      { Header: "category", accessor: "category", align: "center" },
      { Header: "action", accessor: "action", align: "center" },
      { Header: "discount", accessor: "discount", align: "center" },
      { Header: "delete", accessor: "delete", align: "center" },
    ],

    rows: products.map((product) => ({
      product: (
        <Product
          discountPercent={product.discountPercent}
          image={product.image}
          name={product.name}
          description={product.description}
          _id={product._id}
          fullProduct={product}
        />
      ),
      price: product.price,
      category: product.category?.name || product.category || 'No Category',
      quantity: product.quantity,
      action: (
        <MDTypography
          component="a"
          href="#"
          variant="caption"
          color="text"
          fontWeight="medium"
          onClick={() => {
            handleOpenUpdateProductModal(product);
          }}
        >
          Edit
        </MDTypography>
      ),
      discount: (
        <MDTypography
          component="a"
          href="#"
          variant="caption"
          color="text"
          fontWeight="medium"
          onClick={() => {
            handleDiscountModal(product);
          }}
        >
          {product.discountPercent > 0 ?
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '-5px',
                backgroundColor: '#58b05c',
                fontSize: '12px',
                color: '#fff',
                fontWeight: 'bold',
                padding: '5px',
                borderRadius: '5px'
              }}
            >
              {product.discountPercent}%
            </div>
            : null
          }
          Discount
        </MDTypography>
      ),
      delete: (
        <MDTypography
          component="a"
          href="#"
          variant="caption"
          color="text"
          fontWeight="medium"
          onClick={() => {
            Modal.confirm({
              title: "Delete product?",
              content: `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
              okText: "Delete",
              okType: "danger",
              cancelText: "Cancel",
              onOk: () => deleteProducts(product),
            });
          }}
        >
          Delete
        </MDTypography>
      ),
    })),
    selectedProduct,
    onCloseUpdateProductModal: handleCloseUpdateProductModal,
    selectedProduct1,
    onCloseDisountModal: handleCloseDiscountModal,
    onOpenDetails: handleOpenDetails,
    detailsProduct,
    onCloseDetails: handleCloseDetails,
  };
}
