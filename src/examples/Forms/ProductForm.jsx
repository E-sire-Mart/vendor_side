import { notification, Upload, Modal, Divider, TreeSelect } from "antd";
import { useEffect, useState } from "react";
import MDBox from "../../components/MDBox";
import MDButton from "../../components/MDButton";
import MDInput from "../../components/MDInput";
import MDSelect from "../../components/MDSelect/MDSelect";
import ProductService from "../../services/product-service.js";
import CategoryService from "../../services/category-service.js";

function ProductForm({ onClose, initialProduct }) {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productImage, setProductImage] = useState([]);
  const [actionName, setActionName] = useState("Create");
  const [isLoading, setIsLoading] = useState(false); // State to handle loading
  // Ant Design Upload state
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // Shopify-like fields
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPerItem, setCostPerItem] = useState("");
  const [chargeTax, setChargeTax] = useState(false);
  const [trackQuantity, setTrackQuantity] = useState(true);
  const [continueSelling, setContinueSelling] = useState(false);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("g");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [optionsList, setOptionsList] = useState([]); // ["Size", "Color"]
  const [variants, setVariants] = useState([]); // [{ title, sku, price, compareAtPrice, inventoryQuantity, options: { Size: "M" } }]

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryTreeData, setCategoryTreeData] = useState([]);

  useEffect(() => {
    // Load category tree from backend and flatten to options with indentation
    const fetchCategories = async () => {
      try {
        const res = await CategoryService.getTree();
        const tree = res?.data || res?.categories || res; // handle different shapes
        const flat = [];
        const toTreeData = (nodes) => {
          return (nodes || []).map((node) => ({
            title: node.name,
            value: node._id,
            key: node._id,
            selectable: !(node.children && node.children.length), // only leaf selectable
            children: toTreeData(node.children),
          }));
        };
        const walk = (nodes, depth = 0) => {
          if (!Array.isArray(nodes)) return;
          for (const node of nodes) {
            flat.push({ value: node._id, label: `${"\u00A0".repeat(depth * 2)}${node.name}` });
            if (node.children) walk(node.children, depth + 1);
          }
        };
        walk(tree, 0);
        setCategoryOptions(flat);
        setCategoryTreeData(toTreeData(tree));

        // Normalize and backfill category selection for edit mode
        if (initialProduct && initialProduct.category && !productCategory) {
          const cat = initialProduct.category;

          // Helper to resolve name/slug to id from loaded tree
          const resolveToId = (nodes, predicate) => {
            for (const n of nodes || []) {
              if (predicate(n)) return n._id;
              const child = resolveToId(n.children || [], predicate);
              if (child) return child;
            }
            return null;
          };

          let resolvedId = null;
          if (typeof cat === 'string') {
            // If looks like an ObjectId, use directly; otherwise resolve by exact name/slug
            const looksLikeId = /^[a-f\d]{24}$/i.test(cat);
            resolvedId = looksLikeId
              ? cat
              : resolveToId(tree, (n) => n.name === cat || n.slug === String(cat).toLowerCase());
          } else if (typeof cat === 'object' && cat) {
            // If object contains _id/id use it; else try resolve via name/slug
            resolvedId = cat._id || cat.id || resolveToId(tree, (n) => n.name === cat.name || n.slug === cat.slug);
          }

          if (resolvedId) setProductCategory(resolvedId);
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    };
    fetchCategories();

    if (initialProduct) {
      setActionName("Update");
      setProductName(initialProduct.name || "");
      setProductDescription(initialProduct.description || "");
      setProductPrice(initialProduct.price || "");
      setProductQuantity(initialProduct.quantity || "");
      // category may be id string, object with _id/id, or plain name
      const cat = initialProduct.category;
      let initialCatValue = "";
      if (typeof cat === 'string') {
        initialCatValue = cat;
      } else if (cat && typeof cat === 'object') {
        initialCatValue = cat._id || cat.id || "";
      }
      setProductCategory(initialCatValue);
      setCompareAtPrice(initialProduct.compareAtPrice || "");
      setCostPerItem(initialProduct.costPerItem || "");
      setChargeTax(!!initialProduct.chargeTax);
      setTrackQuantity(initialProduct.trackQuantity !== false);
      setContinueSelling(!!initialProduct.continueSellingWhenOutOfStock);
      setSku(initialProduct.sku || "");
      setBarcode(initialProduct.barcode || "");
      setIsPhysicalProduct(initialProduct.isPhysicalProduct !== false);
      setWeight(initialProduct.weight || "");
      setWeightUnit(initialProduct.weightUnit || "g");
      setSeoTitle(initialProduct?.seo?.title || "");
      setSeoDescription(initialProduct?.seo?.description || "");
      setOptionsList(initialProduct.options || []);
      setVariants(initialProduct.variants || []);
      
      // Load existing images from database
      if (initialProduct.image && Array.isArray(initialProduct.image)) {
        const API_URL = process.env.REACT_APP_SERVER_URL;
        const existingImages = initialProduct.image.map((imgPath, index) => ({
          uid: `existing-${index}`,
          name: imgPath.split('/').pop() || `image-${index}`,
          status: 'done',
          url: API_URL + imgPath,
          originFileObj: null, // This indicates it's an existing image
        }));
        setFileList(existingImages);
        setProductImage(initialProduct.image); // Keep track of existing image paths
      }
    }
  }, [initialProduct]);

  // helpers for image preview
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    // Separate new files from existing images
    const newFiles = [];
    const existingImages = [];
    
    newFileList.forEach(file => {
      if (file.originFileObj) {
        // This is a new uploaded file
        newFiles.push(file.originFileObj);
      } else if (file.url && file.uid.startsWith('existing-')) {
        // This is an existing image from database
        existingImages.push(file.url.replace(process.env.REACT_APP_SERVER_URL, ''));
      }
    });
    
    // Combine existing images with new files
    setProductImage([...existingImages, ...newFiles]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoading(true); // Start loading state

    // Create a FormData object to append both the product data and the image file
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDescription);
    formData.append("quantity", productQuantity);
    formData.append("category", productCategory);
    formData.append("price", parseFloat(productPrice));
    if (compareAtPrice !== "") formData.append("compareAtPrice", parseFloat(compareAtPrice));
    if (costPerItem !== "") formData.append("costPerItem", parseFloat(costPerItem));
    formData.append("chargeTax", chargeTax);
    formData.append("trackQuantity", trackQuantity);
    formData.append("continueSellingWhenOutOfStock", continueSelling);
    formData.append("sku", sku);
    formData.append("barcode", barcode);
    formData.append("isPhysicalProduct", isPhysicalProduct);
    if (weight !== "") formData.append("weight", parseFloat(weight));
    formData.append("weightUnit", weightUnit);
    if (optionsList.length) formData.append("options", JSON.stringify(optionsList));
    if (variants.length) formData.append("variants", JSON.stringify(variants));
    formData.append("seoTitle", seoTitle);
    formData.append("seoDescription", seoDescription);

    try {
      if (initialProduct) {
        // For updates, only append new files (existing images are already in productImage array)
        const newFiles = productImage.filter(item => item instanceof File);
        newFiles.forEach((file) => {
          formData.append(`images`, file);
        });
        
        // If initialProduct exists, update the existing product
        const response = await ProductService.update(
          initialProduct._id,
          formData
        );
        notification.success({
          message: "Update successful!",
          description: "Product update is successfully.",
          placement: "topRight", // You can change placement if needed
        });
      } else {
        if (!productName || !productDescription || !productQuantity || !productCategory || !productPrice) {
          notification.error({
            message: "Update error!",
            description: "Please input all fields.",
            placement: "topRight", // You can change placement if needed
          });
          setIsLoading(false); // Stop loading
          return;
        }

        if (productImage.length === 0) {
          notification.error({
            message: "Update error!",
            description: "Please select product's image(s).",
            placement: "topRight", // You can change placement if needed
          });
          setIsLoading(false); // Stop loading
          return;
        }

        productImage.forEach((file, index) => {
          formData.append(`images`, file);
        });

        // Otherwise, create a new product
        const response = await ProductService.save(formData);
        notification.success({
          message: "Product create successful!",
          description: "Product create is successful.",
          placement: "topRight", // You can change placement if needed
        });
      }

      onClose(); // Close form after submission
    } catch (error) {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message;
      if (status === 403 && code === "SHOP_NOT_APPROVED") {
        notification.warning({
          message: "Store pending admin approval",
          description: message ||
            "Your store is not yet verified. You can comment to the admin but cannot add products until approved.",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "An error occurred while saving the product",
          description: message,
          placement: "topRight",
        });
      }
    } finally {
      setIsLoading(false); // Stop loading after operation is done
    }
  };

  return (
    <div onSubmit={handleSubmit}>
      <MDBox p={2}>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Product Name"
            fullWidth
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Product Description"
            fullWidth
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            required
            multiline // This makes the input behave as a textarea
            rows={4}
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Product Price"
            fullWidth
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Product Quantity"
            fullWidth
            value={productQuantity}
            onChange={(e) => setProductQuantity(e.target.value)}
            required
          />
        </MDBox>
        <MDBox mb={2}>
          <MDBox mb={2}>
            <div id="product-category-container">
              <MDBox mb={1}>
                <span style={{ fontSize: 14, color: '#344767' }}>Category</span>
              </MDBox>
              <TreeSelect
                style={{ width: '100%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeData={categoryTreeData}
                value={productCategory || undefined}
                placeholder="Select category (leaf only)"
                treeDefaultExpandAll
                showSearch
                allowClear
                getPopupContainer={(trigger) => trigger.parentNode}
                dropdownMatchSelectWidth
                filterTreeNode={(input, node) => (node?.title || '').toLowerCase().includes(input.toLowerCase())}
                onChange={(val) => setProductCategory(val)}
              />
            </div>
          </MDBox>
        </MDBox>
        <Divider>Pricing</Divider>
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Compare-at price"
            fullWidth
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="number"
            label="Cost per item"
            fullWidth
            value={costPerItem}
            onChange={(e) => setCostPerItem(e.target.value)}
          />
        </MDBox>
        <MDBox mb={2}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={chargeTax} onChange={(e) => setChargeTax(e.target.checked)} />
            Charge tax on this product
          </label>
        </MDBox>

        <Divider>Inventory</Divider>
        <MDBox mb={2}>
          <MDInput type="text" label="SKU" fullWidth value={sku} onChange={(e) => setSku(e.target.value)} />
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="text" label="Barcode" fullWidth value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </MDBox>
        <MDBox mb={2}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={trackQuantity} onChange={(e) => setTrackQuantity(e.target.checked)} />
            Track quantity
          </label>
        </MDBox>
        <MDBox mb={2}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={continueSelling} onChange={(e) => setContinueSelling(e.target.checked)} />
            Continue selling when out of stock
          </label>
        </MDBox>

        <Divider>Shipping</Divider>
        <MDBox mb={2}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={isPhysicalProduct} onChange={(e) => setIsPhysicalProduct(e.target.checked)} />
            This is a physical product
          </label>
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="number" label="Weight" fullWidth value={weight} onChange={(e) => setWeight(e.target.value)} />
        </MDBox>
        <MDBox mb={2}>
          <MDSelect label="Weight unit" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} options={["g","kg","oz","lb"]} />
        </MDBox>

        <Divider>Search engine listing</Divider>
        <MDBox mb={2}>
          <MDInput type="text" label="Page title" fullWidth value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </MDBox>
        <MDBox mb={2}>
          <MDInput type="text" label="Meta description" fullWidth value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} multiline rows={2} />
        </MDBox>

        <Divider>Options</Divider>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Option names (comma-separated, e.g., Size, Color)"
            fullWidth
            value={optionsList.join(", ")}
            onChange={(e) => setOptionsList(e.target.value.split(",").map((s)=>s.trim()).filter(Boolean))}
          />
        </MDBox>
        <MDBox mb={2}>
          <MDInput
            type="text"
            label="Variants JSON (advanced)"
            fullWidth
            value={JSON.stringify(variants)}
            onChange={(e) => {
              try { setVariants(JSON.parse(e.target.value || "[]")); } catch { /* ignore */ }
            }}
            multiline
            rows={4}
          />
        </MDBox>
        <MDBox mb={2}>
          <label htmlFor="productImage">Upload Product Image(s)</label>
          <div style={{ marginTop: 8 }}>
            <Upload
              listType="picture-card"
              multiple
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              accept="image/*"
            >
              {fileList.length >= 8 ? null : <div>+ Upload</div>}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <img alt="preview" style={{ width: "100%" }} src={previewImage} />
            </Modal>
          </div>
        </MDBox>

        <MDButton
          variant="gradient"
          color="info"
          type="submit"
          onClick={(e) => handleSubmit(e)}
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? "Saving..." : actionName}{" "}
          {/* Show "Saving..." when loading */}
        </MDButton>
      </MDBox>
    </div>
  );
}

export default ProductForm;
