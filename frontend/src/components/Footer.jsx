import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-three footer-dark">
      <div className="footer-bg">
        <img src="/assets/img/bg/footer-bg-01.png" className="bg-1" alt="" />
        <img src="/assets/img/bg/footer-bg-02.png" className="bg-2" alt="" />
        <img src="/assets/img/bg/footer-bg-03.png" className="bg-3" alt="" />
      </div>
      <div className="container">
        <div className="footer-top">
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Pages</h5>
                <ul className="footer-menu">
                  <li><Link to="/our-team">Our Team</Link></li>
                  <li><Link to="/pricing">Pricing Plans</Link></li>
                  <li><Link to="/gallery">Gallery</Link></li>
                  <li><a href="#">Settings</a></li>
                  <li><a href="#">Profile</a></li>
                  <li><Link to="/buy-property-list">Listings</Link></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Company</h5>
                <ul className="footer-menu">
                  <li><Link to="/about-us">About Us</Link></li>
                  <li><a href="#">Careers</a></li>
                  <li><Link to="/blog-grid">Blog</Link></li>
                  <li><a href="#">Affiliate Program</a></li>
                  <li><Link to="/add-property-buy">Add Your Listing</Link></li>
                  <li><a href="#">Our Partners</a></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Destinations</h5>
                <ul className="footer-menu">
                  <li><a href="#">Hawai</a></li>
                  <li><a href="#">Istanbul</a></li>
                  <li><a href="#">San Diego</a></li>
                  <li><a href="#">Belgium</a></li>
                  <li><a href="#">Newyork</a></li>
                  <li><a href="#">Los Angeles</a></li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h5 className="footer-title">Useful Links</h5>
                <ul className="footer-menu">
                  <li><a href="#">Legal Notice</a></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link to="/terms-condition">Terms & Conditions</Link></li>
                  <li><a href="#">Support</a></li>
                  <li><a href="#">Refund Policy</a></li>
                  <li><Link to="/contact-us">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="row justify-content-xl-between align-items-center gy-4">
            <div className="col-xl-4">
              <div className="social-icon">
                <a href="#"><i className="fa-brands fa-facebook"></i></a>
                <a href="#"><i className="fa-brands fa-x-twitter"></i></a>
                <a href="#"><i className="fa-brands fa-instagram"></i></a>
                <a href="#"><i className="fa-brands fa-linkedin"></i></a>
                <a href="#"><i className="fa-brands fa-pinterest"></i></a>
              </div>
            </div>

            <div className="col-xl-7">
              <div className="row justify-content-center gy-4">
                <div className="col-md-4 col-sm-6">
                  <div className="contact-info">
                    <span className="bg-primary"><i className="material-icons-outlined">headphones</i></span>
                    <div>
                      <p>Customer Support</p>
                      <h6>+1 56589 54598</h6>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="contact-info">
                    <span className="bg-secondary"><i className="material-icons-outlined">message</i></span>
                    <div>
                      <p>Drop Us an Email</p>
                      <h6>info@dreamsestate.com</h6>
                    </div>
                  </div>
                </div>

                <div className="col-md-4 col-sm-6">
                  <div className="contact-info">
                    <span className="bg-danger"><i className="material-icons-outlined">phone</i></span>
                    <div>
                      <p>Customer Support</p>
                      <h6>1800 5656 5458</h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="text-center">
          <p className="copy-right">Copyright &copy; {new Date().getFullYear()}. All Rights Reserved, Dreams Estate</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;