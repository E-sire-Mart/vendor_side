import { useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { Pagination } from "antd"; // Import Modal, DatePicker, Space, and Pagination from antd
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import Footer from "examples/Footer";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import productsTableData from "layouts/tables/data/productsTableData";
import CreateProductModal from "./Product/CreateProductModal";
import ProductDiscountModal from "./Product/DiscountModal";
import UpdateProductModal from "./Product/UpdateProductModal";
import ProductDetailsModal from "./Product/ProductDetailsModal";

function Tables() {
  const searchText = useSelector((state) => state.search.searchText);
  console.log("searchText", searchText);

  const {
    columns: productTableColumns,
    rows: productTableRows,
    selectedProduct,
    selectedProduct1,
    onCloseUpdateProductModal,
    onCloseDisountModal,
    onOpenDetails,
    detailsProduct,
    onCloseDetails,
  } = productsTableData(searchText); // Pass searchText to productsTableData function

  const [isCreateProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const paginatedRows = productTableRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenCreateProductModal = () => {
    setCreateProductModalOpen(true);
  };

  const handleCloseCreateProductModal = () => {
    onCloseUpdateProductModal(null);
    setCreateProductModalOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <MDTypography variant="h6" color="white" sx={{ width: "100%" }}>
                  Product Table
                </MDTypography>

                <MDBox textAlign="right">
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={handleOpenCreateProductModal}
                    sx={{ boxShadow: "none", width: "200px" }}
                  >
                    Create New Product
                  </MDButton>
                </MDBox>
              </MDBox>

              <MDBox pt={3}>
                <DataTable
                  table={{ columns: productTableColumns, rows: paginatedRows }}
                  isSorted={true}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>

              <MDBox display="flex" justifyContent="center" mt={3} pb={3}>
                <Pagination
                  total={productTableRows.length}
                  showSizeChanger
                  showQuickJumper
                  onChange={handlePageChange}
                  pageSizeOptions={[10, 20, 50, 100]}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                  }}
                  defaultPageSize={pageSize}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <CreateProductModal
        isOpen={isCreateProductModalOpen}
        onClose={handleCloseCreateProductModal}
      />

      {selectedProduct && (
        <UpdateProductModal
          product={selectedProduct}
          onClose={onCloseUpdateProductModal}
          isOpen={selectedProduct !== null}
        />
      )}
      {selectedProduct1 && (
        <ProductDiscountModal
          product={selectedProduct1}
          onClose={onCloseDisountModal}
          isOpen={selectedProduct1 !== null}
        />
      )}
      {detailsProduct && (
        <ProductDetailsModal
          product={detailsProduct}
          isOpen={!!detailsProduct}
          onClose={onCloseDetails}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
