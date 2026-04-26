import { useEffect, useState } from "react";
import React from "react";
import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import { pathAdmin } from "../../../config/api";
import MultiSelectDropdown from "../components/MultiSelectedDropdown";

registerPlugin(FilePondPluginImagePreview);

export default function ProductUpdate() {

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [arrayCategory, setArrayCategory] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [themes, setThemes] = useState([]);
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

 //Set marterial
 const [materialOptions,setMaterialOptions ] = useState([])
 useEffect(()=>{
     const token = localStorage.getItem("token");
     fetch(`${pathAdmin}/admin/materials`,{
         method:"GET",
         headers: {
             "Authorization": `Bearer ${token}`,
             "ngrok-skip-browser-warning": "true",
         },
         credentials:"include"
     })
     .then(res => {
         if (res.status === 200) {
             return res.json();
         }
     })
     .then(data=>{
         if (data?.code === "error") {
             throw new Error(data.message || "Unauthorized");
         }
         const color = data.data.map(item => ({
             name: item.name,
             // color: item.codeHex 
         }));
         setMaterialOptions(color);
 
     })   
     .catch((err) => {
         console.error("Fetch parent categories failed", err);
         alert(err?.message || "Failed to fetch");
         setMaterialOptions([]);
     })
 },[])
 

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const materialMap = materialOptions.reduce((acc, option) => {
    acc[normalizeText(option.name)] = option.name;
    return acc;
  }, {});

  const normalizeMaterial = (value) => materialMap[normalizeText(value)] || "";

  const [materials, setMaterials] = useState([]);
  const [openMaterial, setOpenMaterial] = useState(true);

  const toggleMaterial = (value) => {
    setMaterials((prev) => {
      const newMaterials = prev.includes(value)
        ? prev.filter((m) => m !== value)
        : [...prev, value];


      rebuildVariantsManual(newMaterials, colors, sizes);
      return newMaterials;
    });
  };

  //Set collor
  const [colorOptions,setColorOptions] = useState([])
  useEffect(()=>{
      const token = localStorage.getItem("token");
      fetch(`${pathAdmin}/admin/colors`,{
          method:"GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
          },
          credentials:"include"
      })
      .then(res => {
          if (res.status === 200) {
              return res.json();
          }
      })
      .then(data=>{
          if (data?.code === "error") {
              throw new Error(data.message || "Unauthorized");
          }
          const color = data.data.map(item => ({
              name: item.name,
              code: item.codeHex 
          }));
          setColorOptions(color);
  
      })   
      .catch((err) => {
          console.error("Fetch parent categories failed", err);
          alert(err?.message || "Failed to fetch");
          setColorOptions([]);
      })
  },[])
  
  const colorMap = colorOptions.reduce((acc, option) => {
    acc[normalizeText(option.name)] = option.name;
    return acc;
  }, {});

  const normalizeColor = (value) => colorMap[normalizeText(value)] || String(value || "").trim();

  const [colors, setColors] = useState([]);

  const toggleColor = (colorName) => {
    setColors((prev) => {
      const newColors = prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName];
      rebuildVariantsManual(materials, newColors, sizes);
      return newColors;
    });
  };
  const [openColor, setOpenColor] = useState(true);
  
  const normalizeSize = (value) => {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : value;
  };
  const [sizes, setSizes] = useState([]);
  const [openSize, setOpenSize] = useState(true);


  const toggleSize = (size) => {
    setSizes((prev) => {
      const newSizes = prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size];
      rebuildVariantsManual(materials, colors, newSizes);
      return newSizes;
    });
  };
  const [categoryType, setCategoryType] = useState("");
  //Set size
  const [loadingSize, setLoadingSize] = useState(false);
  const [sizeOptions,setSizeOptions ] = useState([])
  useEffect(() => {
    if (!categoryType) return; 

    setLoadingSize(true); // Bắt đầu loading
    const token = localStorage.getItem("token");
    
    fetch(`${pathAdmin}/admin/sizes`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
        },
        credentials: "include"
    })
    .then(res => res.status === 200 ? res.json() : null)
    .then(data => {
        if (data?.code === "error") throw new Error(data.message);
        
        const size = data.data.map(item => ({ name: item.name }));
        let result = size.map(item => Number(item.name));
        let sizeCate = [];

        if (categoryType === "ring") {
            sizeCate = result.filter(item => item > 47);
        } else if (categoryType === "normal") {
            sizeCate = result.filter(item => item < 47);
        }
        
        setSizeOptions(sizeCate);
    })
    .catch((err) => {
        console.error("Fetch sizes failed", err);
        setSizeOptions([]);
    })
    .finally(() => {
        setLoadingSize(false); 
    });
  }, [categoryType]);
  const [variants, setVariants] = useState([]);
  const [errors, setErrors] = useState({});

  const normalizeVariant = (variant) => ({
    code: variant?.code || "",
    material: normalizeMaterial(variant?.material),
    color: normalizeColor(variant?.color),
    size: normalizeSize(variant?.size || ""),
    price: variant?.price || 0,
    quantity: variant?.quantity || 0,
    image: variant?.images || variant?.image || [],
  });

  const resolveImageUrl = (value) => {
    if (typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return `${pathAdmin}${trimmed}`;
    }
    return trimmed;
  };

  const getVariantKey = (material, color, size) => {
    const materialKey = normalizeText(material);
    const colorKey = normalizeText(color);
    const sizeKey = String(normalizeSize(size ?? ""));
    return `${materialKey}__${colorKey}__${sizeKey}`;
  };

  const buildVariantsWithParams = (baseVariants, currentMaterials, currentColors, currentSizes) => {
    const result = [];
    const variantMap = new Map(
      (baseVariants || []).map((v) => [
        getVariantKey(v.material, v.color, v.size),
        v,
      ])
    );

    currentMaterials.forEach((m) => {

      const colorsToLoop = (categoryType === "charm" || categoryType === "ring") ? currentColors : [""];
      const sizesToLoop = (categoryType === "ring" || categoryType === "normal") ? currentSizes : [""];


      const finalColors = colorsToLoop.length > 0 ? colorsToLoop : [""];
      const finalSizes = sizesToLoop.length > 0 ? sizesToLoop : [""];

      finalColors.forEach((c) => {
        finalSizes.forEach((s) => {
          const old = variantMap.get(getVariantKey(m, c, s));
          result.push({
            material: m,
            color: c,
            size: s,
            price: old?.price || 0,
            quantity: old?.quantity || 0,
            image: old?.image || [],
          });
        });
      });
    });

    return result;
  };

  const updateVariant = (index, field, value) => {
    setVariants(prevVariants => {
      const newVariants = [...prevVariants];
      newVariants[index] = {
        ...newVariants[index],
        [field]: value // 'value' ở đây sẽ là mảng [url1, url2, File1, File2]
      };
      return newVariants;
    });
  };
  const rebuildVariantsManual = (currentMaterials, currentColors, currentSizes) => {
    if (isInitialLoad) return;

    let hasRequired = currentMaterials.length > 0;

    if (categoryType === "charm") {
      hasRequired = hasRequired && currentColors.length > 0;
    } else if (categoryType === "ring") {
      hasRequired = hasRequired && currentColors.length > 0 && currentSizes.length > 0;
    } else if (categoryType === "normal") {
      hasRequired = hasRequired && currentSizes.length > 0;
    }

    if (!hasRequired) {
      setVariants([]);
      return;
    }

    const updatedVariants = buildVariantsWithParams(variants, currentMaterials, currentColors, currentSizes);
    setVariants(updatedVariants);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const controller = new AbortController();

    fetch(`${pathAdmin}/admin/categories/parent`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error") throw new Error(data.message || "Unauthorized");
        setArrayCategory(data?.data || []);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch parent categories failed", err);
        alert(err?.message || "Failed to fetch categories");
        setArrayCategory([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const controller = new AbortController();

    fetch(`${pathAdmin}/admin/collections`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error") throw new Error(data.message || "Unauthorized");
        setCollections(data?.data || []);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch collections failed", err);
        setCollections([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const controller = new AbortController();

    fetch(`${pathAdmin}/admin/themes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.code === "error") throw new Error(data.message || "Unauthorized");
        setThemes(data?.data || []);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch themes failed", err);
        setThemes([]);
      });

    return () => controller.abort();
  }, []);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem("token");
    const controller = new AbortController();

    setLoadingDetail(true);

    fetch(`${pathAdmin}/admin/products/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Khong the tai san pham");
        }
        return data;
      })
      .then((product) => {
        setName(product?.name || "");
        setDesc(product?.description || "");

        const catId = product?.category?._id || product?.category?.id || product?.category || "";
        setCategoryId(catId);

        const selectedCollections = (product?.collections || [])
          .map((c) => c?._id || c?.id || c)
          .filter(Boolean);
        setSelectedCollections(selectedCollections);
        const selectedThemes = (product?.themes || [])
          .map((t) => t?._id || t?.id || t)
          .filter(Boolean);
        setSelectedThemes(selectedThemes);

        const normalized = (product?.variants || []).map(normalizeVariant);
        setIsInitialLoad(true);
        setVariants(normalized);

        setMaterials([...new Set(normalized.map((v) => v.material).filter(Boolean))]);
        setColors([...new Set(normalized.map((v) => v.color).filter(Boolean))]);
        setSizes([...new Set(normalized.map((v) => v.size).filter((value) => value !== "" && value !== null && value !== undefined))]);

        const hasColor = normalized.some((v) => v.color);
        const hasSize = normalized.some((v) => v.size && v.size !== "");
        if (hasColor && hasSize) {
          setCategoryType("ring");
        } else if (hasColor) {
          setCategoryType("charm");
        } else {
          setCategoryType("normal");
        }
        setTimeout(() => setIsInitialLoad(false), 200);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        console.error("Fetch product detail failed", err);
        alert(err?.message || "Khong the tai du lieu san pham");
        navigate("/admin/product");
      })
      .finally(() => setLoadingDetail(false));

    return () => controller.abort();
  }, [id, navigate]);

  const renderOptions = (categories, level = 0) => {
    return categories.map((item) => (
      <React.Fragment key={item.id || item._id}>
        <option value={item.id || item._id}>
          {"--".repeat(level)} {item.name}
        </option>

        {item.children && item.children.length > 0 && renderOptions(item.children, level + 1)}
      </React.Fragment>
    ));
  };

  const findCategoryById = (categories, currentId) => {
    for (const c of categories) {
      if ((c.id || c._id) === currentId) return c;
      if (c.children) {
        const found = findCategoryById(c.children, currentId);
        if (found) return found;
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Ten san pham khong duoc de trong";
    }
    if (!desc.trim()) {
      newErrors.desc = "Mo ta khong duoc de trong";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const uniqueMaterials = [...new Set(materials.map((item) => normalizeMaterial(item)).filter(Boolean))];
    const uniqueColors = [...new Set(colors.map((item) => normalizeColor(item)).filter(Boolean))];
    const uniqueSizes = [
      ...new Set(
        sizes
          .map((item) => normalizeSize(item))
          .filter((value) => value !== "" && value !== null && value !== undefined)
      ),
    ];

    const hasRequiredOptions =
      uniqueMaterials.length > 0 &&
      (categoryType === "charm" ? uniqueColors.length > 0 : uniqueSizes.length > 0);

    if (!hasRequiredOptions) {
      alert("Vui long chon day du truong de tao bien the");
      return;
    }

    const variantsForSubmit = variants;
    if (!variantsForSubmit.length) {
      alert("Chua co bien the nao de cap nhat");
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("name", name);
      formData.append("description", desc);
      formData.append("category", categoryId);
      formData.append("collections", JSON.stringify(selectedCollections));
      formData.append("themes", JSON.stringify(selectedThemes));
      formData.append(
        "options",
        JSON.stringify({
          materials: uniqueMaterials,
          colors: categoryType === "charm" ? uniqueColors : [],
          sizes: categoryType === "charm" ? [] : uniqueSizes.map((size) => String(size)),
        })
      );

      formData.append(
        "variants",
        JSON.stringify(
          variantsForSubmit.map((v) => ({
            code: v.code,
            material: v.material,
            color: v.color,
            size: v.size === "" || v.size === null || v.size === undefined ? "" : String(v.size),
            price: v.price,
            quantity: v.quantity,
            images: (v.image || []).filter((item) => typeof item === "string"),
          }))
        )
      );

      variantsForSubmit.forEach((v, i) => {
        (v.image || []).forEach((item) => {
          if (item instanceof File) {
            formData.append(`images-${i}`, item);
          }
        });
      });

      const response = await fetch(`${pathAdmin}/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        credentials: "include",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Cap nhat that bai");
      }

      alert(data?.message || "Cap nhat san pham thanh cong");
      navigate("/admin/product");
    } catch (error) {
      console.error("Update product failed", error);
      alert(error?.message || "Cap nhat that bai");
    } finally {
      setUpdating(false);
    }
  };

  if (loadingDetail) {
    return (
      <div className="xl:w-[calc(100%-220px)] lg:w-[calc(100%-220px)] w-full pt-[100px] xl:ml-[240px] lg:ml-[260px] left-0 flex flex-col xl:px-[40px] mx-[16px] pr-[55px] md:pr-[30px]">
        <div className="bg-[white] rounded-[20px] p-[30px] text-[14px] text-gray-600">Dang tai du lieu...</div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="xl:w-[calc(100%-240px)] lg:w-[calc(100%-220px)] w-full pt-[100px] lg:ml-[240px] l-0 flex flex-col mx-[16px] sm:px-[30px] px-[10px] sm:pr-[55px] pr-[30px]"
      >
        <div className="sm:text-[30px] text-[20px] font-[700] mb-[30px]">Cap nhat san pham</div>
        <div className="mb-[30px] grid sm:grid-cols-2 grid-cols-1 gap-y-[20px] gap-x-[30px] bg-[white] sm:py-[30px] py-[20px] sm:px-[40px] px-[20px] border border-gray-300 rounded-[15px]">
          <div className="flex flex-col">
            <label className="text-[13px] mb-[5px]">Ten san pham</label>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={`px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
            />

            {errors.name && <span className="text-red-500 text-[11px] mt-[4px]">{errors.name}</span>}
          </div>

          <div className="flex flex-col">
            <label className="text-[13px] mb-[5px]">Danh muc</label>
            <select
              value={categoryId}
              onChange={(e) => {
                const value = e.target.value;
                setCategoryId(value);
                const selected = findCategoryById(arrayCategory, value);
                const name = selected?.name?.toLowerCase() || "";

                if (selected?.name?.toLowerCase().includes("charm")) {
                  setCategoryType("charm");
                } else if (selected?.name?.toLowerCase().includes("nhẫn")) {
                  setCategoryType("ring");
                } else {
                  setCategoryType("normal");
                }
                setVariants([]);
                setMaterials([]);
                setSizes([]);
                setColors([]);
              }}
              className="sm:text-[14px] text-[12px] px-[20px] py-[12px] bg-[#F5F6FA] rounded-[5px] outline-none border border-gray-300"
            >
              <option value=""> -- Chon danh muc -- </option>
              {renderOptions(arrayCategory)}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[13px] mb-[5px]">Bộ sưu tập</label>
            <MultiSelectDropdown
                options={collections}
                selected={selectedCollections}
                onChange={setSelectedCollections}
                placeholder="Chọn bộ sưu tập"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-[13px] mb-[5px]">Chủ đề</label>
            <MultiSelectDropdown
                options={themes}
                selected={selectedThemes}
                onChange={setSelectedThemes}
                placeholder="Chọn chủ đề"
            />
          </div>

          {categoryType !== "" && (
            <>
              <div className="flex flex-col sm:col-span-2 col-span-1">
                <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenMaterial(!openMaterial)}>
                  <label className="text-[13px]">Chat lieu</label>
                  <span>{openMaterial ? "-" : "+"}</span>
                </div>

                {openMaterial && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {materialOptions.map((m) => (
                      <button
                        type="button"
                        key={m.name}
                        onClick={() => toggleMaterial(m.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded border ${materials.includes(m.name) ? "border-blue-500 bg-blue-50" : "border-gray-300"
                          }`}
                      >
                        {/* <span className="w-4 h-4 rounded-full" style={{ background: m.color }} /> */}

                        <span className="text-sm">{m.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(categoryType === "charm" || categoryType === "ring") && (
                <div className="flex flex-col sm:col-span-2 col-span-1">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenColor(!openColor)}>
                    <label className="text-[13px]">Mau sac</label>
                    <span>{openColor ? "-" : "+"}</span>
                  </div>

                  {openColor && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {colorOptions.map((color) => (
                        <button
                          type="button"
                          key={color.name}
                          onClick={() => toggleColor(color.name)}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${colors.includes(color.name) ? "ring-2 ring-blue-500" : ""
                              }`}
                            style={{
                              background: color.gradient ? color.gradient : color.code,
                              border: color.border ? "1px solid #ccc" : "none",
                            }}
                          />
                          <span className="text-sm">{color.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(categoryType === "normal" || categoryType === "ring") && (
                <div className="flex flex-col sm:col-span-2 col-span-1">
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenSize(!openSize)}>
                    <label className="text-[13px]">Size</label>
                    <span>{openSize ? "-" : "+"}</span>
                  </div>

                  {openSize && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {sizeOptions.map((s) => (
                        <button
                          type="button"
                          key={s}
                          onClick={() => toggleSize(s)}
                          className={`px-4 py-2 rounded border text-sm ${sizes.includes(s) ? "border-blue-500 bg-blue-50" : "border-gray-300"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </>
          )}

          {variants.length > 0 && (
            <table className="w-full mt-5 border sm:col-span-2 col-span-1">
              <thead>
                <tr>
                  <th className="w-[100px]">Chat lieu</th>
                  {(categoryType === "charm" || categoryType === "ring") && <th className="w-[100px]">Mau sac</th>}
                  {categoryType !== "charm" && <th className="w-[100px]">Size</th>}
                  <th className="w-[100px]">Gia</th>
                  <th className="w-[100px]">So luong</th>
                  <th className="w-[200px]">Anh</th>
                  <th className="w-[100px]">Hanh dong</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, i) => (
                  <tr key={`${getVariantKey(v.material, v.color, v.size)}-${i}`} className="text-center">
                    <td>{v.material}</td>
                    {(categoryType === "charm" || categoryType === "ring") && <td>{v.color}</td>}
                    {categoryType !== "charm" && <td>{v.size}</td>}
                    <td>
                      <input
                        type="number"
                        className="text-center focus:outline-none"
                        value={v.price}
                        onChange={(e) => updateVariant(i, "price", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="text-center focus:outline-none"
                        value={v.quantity}
                        onChange={(e) => updateVariant(i, "quantity", e.target.value)}
                      />
                    </td>
                    <td>
                      <div className="variant-upload">
                        {(v.image || []).some((item) => typeof item === "string" && item.trim()) && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {(v.image || [])
                              .map((img, imgIndex) => {
                                if (typeof img !== "string" || !img.trim()) return null;

                                return (
                                  <div key={`${i}-${imgIndex}`} className="relative">
                                    <img
                                      src={resolveImageUrl(img)}
                                      alt={`variant-${i}-${imgIndex}`}
                                      className="h-14 w-14 rounded border border-gray-200 object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        updateVariant(
                                          i,
                                          "image",
                                          (v.image || []).filter((_, index) => index !== imgIndex)
                                        );
                                      }}
                                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                                      title="Xoa anh"
                                    >
                                      x
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        <FilePond
                          key={`${getVariantKey(v.material, v.color, v.size)}-${v.image?.length}`}
                          files={
                            v.image
                              ? v.image.filter((file) => file instanceof File).map((file) => ({
                                source: file,
                                options: { type: "local" },
                              }))
                              : []
                          }
                          onupdatefiles={(fileItems) => {

                            const currentUrls = (v.image || []).filter(
                              (item) => typeof item === "string" && item.trim()
                            );
                            const newFiles = fileItems
                              .map((f) => f.file)
                              .filter((file) => file instanceof File);

                            updateVariant(i, "image", [...currentUrls, ...newFiles]);
                          }}
                          allowMultiple={true}
                          maxFiles={5}
                          name={`images-${i}`}
                          labelIdle="Keo tha hoac chon anh"
                        />
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = variants.filter((_, index) => index !== i);
                          setVariants(newVariants);
                        }}
                        className="text-red-500"
                      >
                        Xoa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex flex-col sm:col-span-2 col-span-1">
            <label htmlFor="description" className="text-[13px] mb-[5px]">
              Mo ta
            </label>
            <div className={`${errors.desc ? "border border-red-500 rounded-[5px]" : ""}`}>
              <Editor
                apiKey="4za2bx0zr5zze6b3ux1l4un4bnkypmn6nr1vlsmnhpy3iqrm"
                init={{
                  plugins: [
                    "anchor",
                    "autolink",
                    "charmap",
                    "codesample",
                    "emoticons",
                    "link",
                    "lists",
                    "media",
                    "searchreplace",
                    "table",
                    "visualblocks",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                    "link media table | align lineheight | numlist bullist indent outdent | " +
                    "emoticons charmap | removeformat",
                }}
                initialValue=""
                onEditorChange={(content) => {
                  setDesc(content);
                  setErrors((prev) => ({ ...prev, desc: "" }));
                }}
                value={desc}
                id="desc"
              />
              {errors.desc && <span className="text-red-500 text-[11px] mt-[4px]">{errors.desc}</span>}
            </div>

            <div className="mt-[30px] flex flex-col items-center gap-y-[20px]">
              <button
                disabled={updating}
                className="sm:w-[270px] w-[200px] hover:bg-second rounded-[10px] sm:text-[20px] text-[16px] text-white bg-pri px-[20px] py-[20px] disabled:opacity-50"
              >
                {updating ? "Dang cap nhat..." : "Cap nhat san pham"}
              </button>
              <Link to="/admin/product" className="text-pri hover:text-second sm:text-[20px] text-[16px] underline">
                Quay lai danh sach
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
