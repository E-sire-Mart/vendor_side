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
import deliveryPeopleTableData from "layouts/tables/data/deliveryPeopleTableData";
import { useState } from "react";
import CreateDeliveryPersonModal from "./DeliveryPerson/CreateDeliveryPersonModal";
import { useSelector } from "react-redux"; // Import useSelector

import UpdateDeliveryPersonModal from "./DeliveryPerson/UpdateDeliveryPersonModal";

function Tables() {
  const searchText = useSelector((state) => state.search.searchText);
  console.log("searchText", searchText);

  const {
    columns: deliveryPeopleTableColumns,
    rows: deliveryPeopleTableRows,
    selectedDeliveryPeople,
    onCloseUpdateDeliveryPersonModal,
  } = deliveryPeopleTableData(searchText);

  const [isCreateDeliveryPersonModalOpen, setCreateDeliveryPersonModalOpen] =
    useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate paginated rows
  const paginatedRows = deliveryPeopleTableRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleOpenCreateDeliveryPersonModal = () => {
    setCreateDeliveryPersonModalOpen(true);
  };

  const handleCloseCreateDeliveryPersonModal = () => {
    onCloseUpdateDeliveryPersonModal(null);
    setCreateDeliveryPersonModalOpen(false);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          {/* Delivery People Table */}
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
                  Delivery People Table
                </MDTypography>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <MDBox textAlign="right">
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleOpenCreateDeliveryPersonModal}
                      sx={{ boxShadow: "none" }}
                    >
                      Create New Person
                    </MDButton>
                  </MDBox>
                </div>
              </MDBox>
              <MDBox pt={3}>
                <DataTable
                  table={{
                    columns: deliveryPeopleTableColumns,
                    rows: paginatedRows,
                  }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
              <MDBox display="flex" justifyContent="center" mt={3} pb={3}>
                <Pagination
                  total={deliveryPeopleTableRows.length}
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

      {/* Create Delivery Person Modal */}
      <CreateDeliveryPersonModal
        isOpen={isCreateDeliveryPersonModalOpen}
        onClose={handleCloseCreateDeliveryPersonModal}
      />

      {/* Update Delivery Person Modal */}
      {selectedDeliveryPeople && (
        <UpdateDeliveryPersonModal
          deliverPerson={selectedDeliveryPeople}
          onClose={onCloseUpdateDeliveryPersonModal}
          isOpen={selectedDeliveryPeople !== null}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
}

export default Tables;
