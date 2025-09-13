import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

import logo from "../assets/images/logo.png";
import whatsapp from "../assets/images/whatsapp.png";
import youtube from "../assets/images/youtube.png";
import instagram from "../assets/images/instagram.png";
import facebook from "../assets/images/facebook.png";
import bikeImg from "../assets/images/bike.png";
import mapIcon from "../assets/images/map.png";
import internetIcon from "../assets/images/internet.png";
import phoneIcon from "../assets/images/phone.png";

export default function Footer() {
  return (
    <footer className="drive-footer">
      <div className="container-fluid">
        <div className="drive-footer-inner">

          <div className="footer-left">
            <img src={logo} alt="DriveRP" className="footer-logo" />

            <div className="get-in-touch-row">
              <span className="get-in-touch">Get in touch</span>

              <div className="social-row">
                <a href="#" aria-label="WhatsApp">
                  <img src={whatsapp} alt="whatsapp" className="social-icon" />
                </a>
                <a href="#" aria-label="YouTube">
                  <img src={youtube} alt="youtube" className="social-icon" />
                </a>
                <a href="#" aria-label="Instagram">
                  <img src={instagram} alt="instagram" className="social-icon" />
                </a>
                <a href="#" aria-label="Facebook">
                  <img src={facebook} alt="facebook" className="social-icon" />
                </a>
              </div>
            </div>
          </div>

          <nav className="footer-nav">
            <ul className="list-unstyled">
              <li className="nav-blank" />
              <li><Link to="/" className="nav-link-footer">Home</Link></li>
              <li><Link to="/about" className="nav-link-footer">About Us</Link></li>
              <li><Link to="/contact" className="nav-link-footer">Contact Us</Link></li>
              <li><Link to="/buy" className="nav-link-footer">Buy Bike</Link></li>
              <li><Link to="/sell" className="nav-link-footer">Sell Bike</Link></li>
            </ul>
          </nav>

          <div className="footer-cats">
            <ul className="list-unstyled">
              <li className="cats-heading">Electric Two-Wheelers</li>
              <li className="cat-item">Motorcycles</li>
              <li className="cat-item">Scooters</li>
              <li className="cat-item">Mopeds</li>
              <li className="cat-item">ATV</li>
              <li className="cat-item">Custom Bikes</li>
            </ul>
          </div>

          <div className="footer-bike-wrap">
            <img src={bikeImg} alt="bike" className="footer-bike" />
          </div>

          <div className="footer-right">
            <div className="address-title">Address:</div>

            <div className="address-lines">
              <div className="addr-row">
                <span className="addr-icon">
                  <img src={mapIcon} alt="map" />
                </span>
                <span>51, Rajaji Street,</span>
              </div>

              <div className="addr-row">
                <span>GST Road,</span>
              </div>

              <div className="addr-row">
                <span>Chengalpattu-603104</span>
              </div>

              <div className="addr-row addr-site">
                <span className="addr-icon">
                  <img src={internetIcon} alt="website" />
                </span>
                <a href="https://www.DriveRp.in" className="website-link">www.DriveRp.in</a>
              </div>

              <div className="addr-row">
                <span className="addr-icon">
                  <img src={phoneIcon} alt="phone" />
                </span>
                <span>+91 987 952 1234</span>
              </div>
            </div>
          </div>

        </div> {/* /drive-footer-inner */}
      </div>
    </footer>
  );
}
