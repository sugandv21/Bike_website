import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const ApiContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = false;

function normalizeToArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.results && Array.isArray(data.results)) return data.results;
  // If it's an object with numeric keys? unlikely; wrap object as single-item array
  return [data];
}

export const ApiProvider = ({ children }) => {
  const [heroData, setHeroData] = useState(null);
  const [infoData, setInfoData] = useState(null);
  const [supportData, setSupportData] = useState([]);

  useEffect(() => {
    const fetchHero = axios
      .get("/hero/")
      .then((res) => res.data)
      .catch((e) => {
        console.error("Hero API Error:", e);
        return null;
      });

    const fetchInfo = axios
      .get("/info/")
      .then((res) => res.data)
      .catch((e) => {
        console.error("Info API Error:", e);
        return null;
      });

    const fetchSupport = axios
      .get("/support/")
      .then((res) => res.data)
      .catch((e) => {
        console.error("Support API Error:", e);
        return [];
      });

    Promise.all([fetchHero, fetchInfo, fetchSupport]).then(([h, i, s]) => {
      try {
        // Normalize hero
        const heroList = normalizeToArray(h);
        if (heroList.length > 0) setHeroData(heroList[0]);
        else setHeroData(null);

        // Normalize info
        const infoList = normalizeToArray(i);
        if (infoList.length > 0) setInfoData(infoList[0]);
        else setInfoData(null);

        // Normalize support -> always array
        const supportList = normalizeToArray(s);
        setSupportData(supportList);
      } catch (err) {
        console.error("Error normalizing API responses:", err);
        setHeroData(null);
        setInfoData(null);
        setSupportData([]);
      }
    });
  }, []);

  return (
    <ApiContext.Provider value={{ heroData, infoData, supportData }}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => useContext(ApiContext);
