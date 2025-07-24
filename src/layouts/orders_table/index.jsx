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
import ordersTableData from "layouts/tables/data/ordersTableData";
import deliveryPeopleTableData from "layouts/tables/data/deliveryPeopleTableData";
import { useState } from "react";
import UpdateOrderStatusModal from "./updateOrder/UpdateOrderStatusModal";
import { useSelector } from "react-redux"; // Import useSelector

function Tables() {
  const searchText = useSelector((state) => state.search.searchText);
  console.log("searchText", searchText);

  const {
    columns: orderTableColumns,
    rows: orderTableRows,
    selectedOrderId,
    onCloseUpdateOrderModal,
  } = ordersTableData(searchText);

  const { columns: deliveryPeopleTableColumns, rows: deliveryPeopleTableRows } =
    deliveryPeopleTableData();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate paginated rows
  const paginatedRows = orderTableRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Orders Table */}
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
              >
                <MDTypography variant="h6" color="white">
                  Orders Table
                </MDTypography>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{ columns: orderTableColumns, rows: paginatedRows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>

              <MDBox display="flex" justifyContent="center" mt={3} pb={3}>
                <Pagination
                  total={orderTableColumns.length}
                  showSizeChanger
                  showQuickJumper
                  onChange={handlePageChange}
                  pageSizeOptions={[10, 20, 50, 100]}
                  onShowSizeChange={(current, size) => {
                    setPageSize(size);
                  }}
                  defaultPageSize={10}
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Update Order Status Modal */}
      {selectedOrderId && (
        <UpdateOrderStatusModal
          orderId={selectedOrderId}
          onClose={onCloseUpdateOrderModal}
          isOpen={selectedOrderId !== null}
          deliverPeople={deliveryPeopleTableRows}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
