import React from 'react';
import { FaKeyboard, FaChair, FaHandPaper, FaThumbsUp, FaCheckCircle } from 'react-icons/fa';

export const instructionSteps = [
  {
    id: 1,
    title: "টাচ টাইপিং কী?",
    icon: <FaKeyboard size={50} color="#1e88e5" />,
    content: (
      <>
        <p>
          <strong>টাচ টাইপিং (Touch Typing)</strong> হলো কীবোর্ডের দিকে না তাকিয়ে টাইপ করার একটি পদ্ধতি। 
          এটি আপনাকে দ্রুত এবং নির্ভুলভাবে টাইপ করতে সাহায্য করে।
        </p>
        <p>
          এই কোর্সে আমরা শিখব কীভাবে প্রতিটি আঙ্গুলের জন্য নির্দিষ্ট কী (Key) ব্যবহার করতে হয়।
          শুরুতে গতি কম হতে পারে, কিন্তু ধৈর্য ধরুন। সঠিক আঙ্গুল ব্যবহার করাই মূল চাবিকাঠি।
        </p>
      </>
    )
  },
  {
    id: 2,
    title: "সঠিকভাবে বসার নিয়ম",
    icon: <FaChair size={50} color="#43a047" />,
    content: (
      <>
        <ul style={{textAlign: 'left', display: 'inline-block', lineHeight: '1.8'}}>
          <li>✅ মেরুদণ্ড সোজা করে বসুন।</li>
          <li>✅ আপনার কনুই ৯০ ডিগ্রি কোণে থাকা উচিত।</li>
          <li>✅ মনিটর চোখের সোজাসুজি বা সামান্য নিচে রাখুন।</li>
          <li>✅ কবজি (Wrists) টেবিলের সাথে ঠেকিয়ে রাখবেন না, হালকা ভাসিয়ে রাখুন।</li>
        </ul>
      </>
    )
  },
  {
    id: 3,
    title: "হোম রো (Home Row) পরিচিতি",
    icon: <FaHandPaper size={50} color="#ffa000" />,
    content: (
      <>
        <p>
          আপনার আঙ্গুলগুলো সব সময় কীবোর্ডের মাঝখানের সারিতে থাকতে হবে। একে <strong>Home Row</strong> বলা হয়।
        </p>
        <div style={{background: '#f5f5f5', padding: '15px', borderRadius: '8px', margin: '15px 0'}}>
          <p><strong>বাম হাত:</strong> A, S, D, F</p>
          <p><strong>ডান হাত:</strong> J, K, L, ; (সেমিকোলন)</p>
        </div>
        <p>লক্ষ্য করুন, <strong>F</strong> এবং <strong>J</strong> কী-এর উপর ছোট দাগ আছে, যা না তাকিয়ে পজিশন বুঝতে সাহায্য করে।</p>
      </>
    )
  },
  {
    id: 4,
    title: "বৃদ্ধাঙ্গুলির ব্যবহার (Thumbs)",
    icon: <FaThumbsUp size={50} color="#fb8c00" />,
    content: (
      <>
        <p>
          আপনার দুই হাতের বৃদ্ধাঙ্গুলি (Thumbs) শুধুমাত্র <strong>Space Bar</strong> চাপার জন্য ব্যবহার হবে।
        </p>
        <p>
          সাধারণত আপনি যেই হাত দিয়ে শেষ অক্ষর টাইপ করেছেন, তার বিপরীত হাতের বৃদ্ধাঙ্গুলি দিয়ে স্পেস চাপাই উত্তম, 
          তবে আপনি সুবিধামত যেকোনো একটি ব্যবহার করতে পারেন।
        </p>
      </>
    )
  },
  {
    id: 5,
    title: "আপনি প্রস্তুত!",
    icon: <FaCheckCircle size={50} color="#2ecc71" />,
    content: (
      <>
        <p>
          এখন আমরা অনুশীলন শুরু করব। মনে রাখবেন:
        </p>
        <h3 style={{color: '#d32f2f', marginTop: '10px'}}>কীবোর্ডের দিকে তাকাবেন না!</h3>
        <p>
          ভুল হলেও সমস্যা নেই, কিন্তু সঠিক আঙ্গুল ব্যবহার নিশ্চিত করুন। 
          পরের ধাপে আমরা A, S, D, F এবং J, K, L, ; টাইপ করা শিখব।
        </p>
      </>
    )
  }
];
