import React, { useState } from "react";
import "./about.css";
import Navbar from "../navbar";
import Footer from "../footer";

const About = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How can I report waste?",
      answer: "Click on 'Report Waste' from the homepage, upload a photo, and provide details.",
    },
    {
      question: "Who handles waste reports?",
      answer: "Reports are forwarded to local authorities and community organizations for action.",
    },
    {
      question: "Can I volunteer or join the team?",
      answer: "Yes! Contact us via email, and we'll get back to you with opportunities.",
    },
    {
      question: "How does the platform track waste?",
      answer: "The platform uses AI and geolocation features to track and report waste in real-time.",
    },
  ];

  return (
    <>
     <div>
        <Navbar/>
    </div>
    <br />
    <br />
    <div className="about-container">
    <header className="about-header">
      <h1 className="fadeIn">About Us</h1>
      <p className="fadeIn">
        Welcome to <strong>Bin Buddy</strong>, your partner in creating a cleaner, greener environment.
        Our platform empowers communities to report waste issues and take actionable steps toward a sustainable future.
      </p>
    </header>

      <section className="about-section slideUp">
        <h2>Our Goals</h2>
        <ul>
          <li>Encourage responsible waste management through modern technology.</li>
          <li>Provide a simple way for individuals to report and track waste issues.</li>
          <li>Collaborate with local authorities and communities for effective solutions.</li>
          <li>Raise awareness about the impact of improper waste disposal on the environment.</li>
          <li>Educate the public on recycling and waste reduction best practices.</li>
          <li>Provide a platform for waste-related data collection and analysis for policy-making.</li>
        </ul>
      </section>

      <section className="about-section slideUp">
        <h2>Our Ambitions</h2>
        <ul>
          <li>Expand the platform to include real-time waste tracking using AI.</li>
          <li>Build partnerships with municipalities to enhance waste management systems.</li>
          <li>Create a global community of environmentally-conscious individuals.</li>
          <li>Inspire action to protect our planet for future generations.</li>
          <li>Develop partnerships with recycling companies to increase waste processing efficiency.</li>
          <li>Launch a mobile app for easy reporting and community engagement.</li>
        </ul>
      </section>

      <section className="about-section slideUp">
        <h2>Testimonials</h2>
        <p>
          "Bin Buddy has helped our community stay cleaner and more organized. The ability to report waste issues easily has made a huge difference!" - Sarah L., Eco Advocate
        </p>
        <p>
          "As a local business, we’ve partnered with Bin Buddy to address waste management in our neighborhood. Their platform has been a game-changer." - Tom B., Small Business Owner
        </p>
      </section>

      <section className="about-section contact-section fadeIn">
        <h2>Contact Us</h2>
        <p>
          Have questions, feedback, or want to get involved? Reach out to us:
        </p>
        <ul>
          <li>Email: <a href="mailto:contact@wastealert.com">contact@wastealert.com</a></li>
          <li>Phone: +1 (123) 456-7890</li>
          <li>Address: 123 Green Street, Eco City, Earth</li>
        </ul>
      </section>

      <section className="about-section slideUp">
        <h2>Get Involved</h2>
        <p>
          We believe that everyone can make a difference in creating a cleaner environment. Whether you're an individual, community group, or organization, you can help! Here's how:
        </p>
        <ul>
          <li>Sign up for our newsletter to stay informed.</li>
          <li>Report waste in your community using our platform.</li>
          <li>Volunteer at local clean-up events.</li>
          <li>Donate to support waste management initiatives.</li>
        </ul>
      </section>

      <section className="about-section slideUp">
        <h2>FAQs</h2>
        <div className="faq-menu">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <div
                className={`faq-question ${openIndex === index ? "open" : ""}`}
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span className="faq-toggle-icon">{openIndex === index ? "-" : "+"}</span>
              </div>
              {openIndex === index && (
                <div className="faq-answer open">{faq.answer}</div>
                )}
            </div>
          ))}
        </div>
      </section>
     
    </div>
    <br />
    <div>
        <Footer/>
    </div>
    </>
  );
};

export default About;