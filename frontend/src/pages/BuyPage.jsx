import { Link } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { debounce } from "lodash";
import ScootyImg from "../assets/images/scooty.png";
import MotorImg from "../assets/images/motorbike.png";
import EvImg from "../assets/images/ev.png";
import ccImg from "../assets/images/cc.png";
import logoImg from "../assets/images/logo.png";

function AccordionBlock({ title, children, open, onToggle }) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-transparent text-left"
        type="button"
      >
        <span className="font-semibold text-xl">{title}</span>
        <span className="text-xl">{open ? "▴" : "▾"}</span>
      </button>
      <hr />
      {open && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}

export default function BuyPage() {
  const [bikes, setBikes] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState("-created_at");
  const [searchQuery, setSearchQuery] = useState("");

  const [priceRange, setPriceRange] = useState([10000, 250000]);
  const [category, setCategory] = useState(""); // "Scooty" | "Motor bike" | "EV"
  const [brand, setBrand] = useState("");
  const [yearRange, setYearRange] = useState([2007, 2025]);
  const [kmMax, setKmMax] = useState(100000);
  const [engineMin, setEngineMin] = useState(0);
  const [engineMax, setEngineMax] = useState(null); // optional engine max for 'Below 200 CC' style
  const [fuelType, setFuelType] = useState("");
  const [color, setColor] = useState("");

  const [openBudget, setOpenBudget] = useState(false);
  const [openCategories, setOpenCategories] = useState(false);
  const [openBrand, setOpenBrand] = useState(false);
  const [openYear, setOpenYear] = useState(false);
  const [openKm, setOpenKm] = useState(false);
  const [openEngine, setOpenEngine] = useState(false);
  const [openFuel, setOpenFuel] = useState(false);
  const [openColor, setOpenColor] = useState(false);

  const sortOptions = [
    { label: "Newest First", value: "-created_at" },
    { label: "Price - Low to High", value: "price" },
    { label: "Price - High to Low", value: "-price" },
    { label: "KM Driven - Low to High", value: "kilometers" },
    { label: "KM Driven - High to Low", value: "-kilometers" },
    { label: "Year - old to New", value: "year" },
    { label: "Year - New to Old", value: "-year" },
  ];

  const buildParams = () => {
    const params = {
      page,
      page_size: pageSize,
      ordering: sortBy,
    };
    if (searchQuery) params.search = searchQuery;
    if (Array.isArray(priceRange)) {
      if (priceRange[0] !== undefined && priceRange[0] !== null) params.price_min = Number(priceRange[0]);
      if (priceRange[1] !== undefined && priceRange[1] !== null) params.price_max = Number(priceRange[1]);
    }
    if (brand) params.brand = brand;
    if (category) params.category = category;
    if (Array.isArray(yearRange)) {
      if (yearRange[0] !== undefined && yearRange[0] !== null) params.year_min = Number(yearRange[0]);
      if (yearRange[1] !== undefined && yearRange[1] !== null) params.year_max = Number(yearRange[1]);
    }
    if (kmMax !== undefined && kmMax !== null) params.km_max = Number(kmMax);
    if (engineMin !== undefined && engineMin !== null) params.engine_cc_min = Number(engineMin);
    if (engineMax !== undefined && engineMax !== null) params.engine_cc_max = Number(engineMax);
    if (fuelType) params.fuel_type = fuelType;
    if (color) params.color = color;
    return params;
  };

  const fetchBikes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/buybikes/", { params: buildParams() });

      const list = Array.isArray(data) ? data : data.results ? data.results : [];
      const total = data.count ?? (Array.isArray(data) ? data.length : list.length);

      setBikes(list);
      setCount(total);
    } catch (err) {
      console.error("Fetch bikes error:", err);
      setBikes([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearchRef = useRef(debounce((val) => { setPage(1); setSearchQuery(val); }, 400));
  const debouncedSearch = (val) => debouncedSearchRef.current && debouncedSearchRef.current(val);

  useEffect(() => {
    return () => { if (debouncedSearchRef.current && debouncedSearchRef.current.cancel) debouncedSearchRef.current.cancel(); };
  }, []);

  useEffect(() => {
    fetchBikes();
  }, [page, sortBy, searchQuery, priceRange, brand, category, yearRange, kmMax, engineMin, engineMax, fuelType, color]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const handleCategorySelect = (val) => { setCategory(val === category ? "" : val); setPage(1); };
  const handleBrandSelect = (val) => { setBrand(val === brand ? "" : val); setPage(1); };

  const engineOptions = [
    { label: "Below 100 CC", value: 100 },
    { label: "Below 200 CC", value: 200 },
    { label: "Below 300 CC", value: 300 },
    { label: "Below 400 CC", value: 400 },
  ];

  return (
    <div className="flex gap-6 px-6 md:px-10 py-8">
      <aside className="w-72 self-start bg-[#e1f0fb] p-4 rounded-md border-4 filter-aside">

        <h3 className="font-bold text-xl mb-3">Filter</h3>

        <AccordionBlock title="Budget" open={openBudget} onToggle={() => setOpenBudget(!openBudget)}>
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                className="w-1/2 p-2 border rounded"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
              />
              <input
                type="number"
                className="w-1/2 p-2 border rounded"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || 0)])}
              />
            </div>

            <div className="mb-1 text-xs text-gray-600 flex justify-between">
              <span>Minimum</span>
              <span>Maximum</span>
            </div>
            <input
              type="range"
              min="0"
              max="500000"
              step="1000"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </AccordionBlock>

        <AccordionBlock title="Categories" open={openCategories} onToggle={() => setOpenCategories(!openCategories)}>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleCategorySelect("Scooty")}
              className={`flex flex-col items-center p-2 rounded-md border ${category === "Scooty" ? "bg-white shadow" : "bg-transparent"}`}
              title="Scooty"
            >
              <img src={ScootyImg} alt="Scooty" className="w-12 h-12 object-contain mb-1" />
              <div className="text-xs">Scooty</div>
            </button>

            <button
              onClick={() => handleCategorySelect("Motor bike")}
              className={`flex flex-col items-center p-2 rounded-md border ${category === "Motor bike" ? "bg-white shadow" : "bg-transparent"}`}
              title="Motor bike"
            >
              <img src={MotorImg} alt="Motor bike" className="w-12 h-12 object-contain mb-1" />
              <div className="text-xs">Motor bike</div>
            </button>

            <button
              onClick={() => handleCategorySelect("EV")}
              className={`flex flex-col items-center p-2 rounded-md border ${category === "EV" ? "bg-white shadow" : "bg-transparent"}`}
              title="EV"
            >
              <img src={EvImg} alt="EV" className="w-12 h-12 object-contain mb-1" />
              <div className="text-xs">EVs</div>
            </button>
          </div>
        </AccordionBlock>

        <AccordionBlock title="Brand" open={openBrand} onToggle={() => setOpenBrand(!openBrand)}>
          <div className="flex flex-col gap-2">
            {["TVS", "Honda", "Bajaj", "Hero", "Royal Enfield"].map((b) => (
              <button
                key={b}
                onClick={() => handleBrandSelect(b)}
                className={`text-left p-2 rounded ${brand === b ? "bg-white shadow" : "bg-transparent"}`}
              >
                {b}
              </button>
            ))}
            <input
              placeholder="Other brand..."
              className="mt-2 p-2 border rounded"
              value={brand && !["TVS","Honda","Bajaj","Hero","Royal Enfield"].includes(brand) ? brand : ""}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </AccordionBlock>

        <AccordionBlock title="Year" open={openYear} onToggle={() => setOpenYear(!openYear)}>
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="number"
                className="w-1/2 p-2 border rounded"
                value={yearRange[0]}
                onChange={(e) => setYearRange([Number(e.target.value || 0), yearRange[1]])}
                min="1980"
                max={yearRange[1]}
              />
              <input
                type="number"
                className="w-1/2 p-2 border rounded"
                value={yearRange[1]}
                onChange={(e) => setYearRange([yearRange[0], Number(e.target.value || 0)])}
                min={yearRange[0]}
                max={new Date().getFullYear()}
              />
            </div>
            <div className="text-xs text-gray-600 mb-1">Minimum Year — Maximum Year</div>
            <input
              type="range"
              min="1980"
              max={new Date().getFullYear()}
              step="1"
              value={yearRange[1]}
              onChange={(e) => setYearRange([yearRange[0], Number(e.target.value)])}
              className="w-full"
            />
          </div>
        </AccordionBlock>

        <AccordionBlock title="Kilometers" open={openKm} onToggle={() => setOpenKm(!openKm)}>
          <div>
            <div className="mb-2 text-sm">Under</div>
            <input
              type="number"
              className="w-full p-2 border rounded mb-2"
              value={kmMax}
              onChange={(e) => setKmMax(Number(e.target.value || 0))}
              placeholder="100000 Km"
            />
            <input
              type="range"
              min="0"
              max="200000"
              step="500"
              value={kmMax}
              onChange={(e) => setKmMax(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">0 — 200000 Km</div>
          </div>
        </AccordionBlock>

        <AccordionBlock title="EngineTrim CC" open={openEngine} onToggle={() => setOpenEngine(!openEngine)}>
          <div className="flex flex-col gap-2">
            {engineOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setEngineMin(0); setEngineMax(opt.value); setPage(1); }}
                className={`text-left p-2 rounded ${engineMax === opt.value ? "bg-white shadow" : "bg-transparent"}`}
              >
                {opt.label}
              </button>
            ))}

            <div className="mt-2 text-xs text-gray-500">Or set minimum cc</div>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={engineMin}
              onChange={(e) => { setEngineMin(Number(e.target.value || 0)); setEngineMax(null); }}
              placeholder="Minimum CC"
            />
          </div>
        </AccordionBlock>

        <AccordionBlock title="Fuel Type" open={openFuel} onToggle={() => setOpenFuel(!openFuel)}>
          <select className="w-full p-2 border rounded" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
            <option value="">Any</option>
            <option value="Petrol">Petrol</option>
            <option value="Electric">Electric</option>
            <option value="Diesel">Diesel</option>
          </select>
        </AccordionBlock>

        <AccordionBlock title="Color" open={openColor} onToggle={() => setOpenColor(!openColor)}>
          <input className="w-full p-2 border rounded" value={color} onChange={(e) => setColor(e.target.value)} placeholder="Blue, Red ..." />
        </AccordionBlock>

        {/* <div className="flex gap-2 mt-2">
          <button
            onClick={() => { setPage(1); fetchBikes(); }}
            className="flex-1 bg-[#07435c] text-white py-2 rounded"
          >
            Apply
          </button>
          <button
            onClick={() => {
              setPriceRange([10000, 250000]);
              setBrand("");
              setCategory("");
              setYearRange([2007, 2025]);
              setKmMax(100000);
              setEngineMin(0);
              setEngineMax(null);
              setFuelType("");
              setColor("");
              setPage(1);
              fetchBikes();
            }}
            className="flex-1 border py-2 rounded"
          >
            Reset
          </button>
        </div> */}
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold">{count} Bikes In Tamil Nadu</div>
          <div className="flex items-center gap-4">
            {/* <input
              type="text"
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Search ..."
              className="p-2 border rounded"
            /> */}
            <h3 className="text-2xl font-bold">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="p-2 border rounded text-xl font-bold"
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {bikes.map((b) => (
              <Link to={`/buy/${b.id}`} className="block hover:shadow-lg transition">
              <div
                key={b.id}
                className="bg-white rounded-lg overflow-hidden shadow relative flex flex-col h-full"
              >
                
                <div className="relative h-64 bg-gray-50 flex items-center justify-center">
                  {b.card_bg_image_url && (
                    <img
                      src={b.card_bg_image_url}
                      alt="card bg"
                      className="absolute inset-0 w-full h-full object-cover opacity-100"
                    />
                  )}
                  <img
                      src={logoImg}
                      alt="logo"
                      className="absolute w-22 h-10 top-0 right-0"
                    />

                  <img
                    src={b.featured_image_url ?? b.featured_image}
                    alt={b.title}
                    className="relative max-h-48 object-contain p-4"
                  />

                  {b.is_booked && (
                    <span className="absolute -left-0 -top-0 bg-red-600 text-white text-lg px-6 py-1 rounded-lg z-99">
                      Booked
                    </span>
                  )}
                </div>

                <div className="p-4 bg-[#e1fffe] flex-1 flex flex-col">
                  <h4 className="font-semibold text-center text-lg md:text-2xl">{b.title}</h4>

                  <div className="flex items-center justify-center gap-2 mt-2 font-semibold text-md md:text-xl text-gray-900">
                   <div className="flex items-center gap-1">
                                           <img src={ccImg} alt="cc" className="w-6 h-6" />
                                           <span>{b.kilometers ?? "-"} Km</span>
                                         </div>
                    <div>•</div>
                    <div>{b.fuel_type ?? ""}</div>
                    <div>•</div>
                    <div>{b.owner ?? ""}</div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-xl md:text-2xl font-bold">₹ {Number(b.price).toLocaleString()}</div>
                    <div className="flex gap-2 mt-1 px-4 ">
                      {b.location_obj?.image_url && (
                        <img src={b.location_obj.image_url} alt={b.location_obj?.name} className="w-5 h-5 object-cover rounded-full" />
                      )}
                      <div className="text-lg md:text-xl font-semibold">{b.location_obj?.name ?? ""}</div>
                    </div>
                  </div>
                
                </div>
              </div>
              </Link>
            ))}
          </div>
        )}

        {/* <div className="mt-8 flex items-center justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">
            Prev
          </button>
          <div className="px-3 py-1 border rounded">Page {page} of {totalPages || 1}</div>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded">
            Next
          </button>
        </div> */}
      </div>
    </div>
  );
}
