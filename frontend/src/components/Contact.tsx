import React, { useState } from "react";

const ContactForm = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, message } = form;

    if (!firstName || !lastName || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert("Your message was sent successfully.");
        setForm({ firstName: "", lastName: "", email: "", phone: "", message: "" });
      } else {
        alert("There was a problem sending your message.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="bg-orange-200 shadow-2xl py-6 px-7 rounded-xl mr-5">
      <div className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-5">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="p-2 border rounded-md"
            value={form.firstName}
            onChange={handleChange}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="p-2 border rounded-md"
            value={form.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="p-2 border rounded-md"
            value={form.email}
            onChange={handleChange}
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            className="p-2 border rounded-md"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <textarea
          name="message"
          placeholder="Your Message"
          rows={4}
          className="p-2 border rounded-md resize-none"
          value={form.message}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md w-fit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
