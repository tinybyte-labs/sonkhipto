export const convertBengaliDigits = (str: string): string => {
  const bengaliNumbers = "০১২৩৪৫৬৭৮৯";
  return str.replace(/[০-৯]/g, (digit) =>
    bengaliNumbers.indexOf(digit).toString(),
  );
};

export const bengaliMonthMap: Record<string, string> = {
  জানুয়ারি: "January",
  ফেব্রুয়ারি: "February",
  মার্চ: "March",
  এপ্রিল: "April",
  মে: "May",
  জুন: "June",
  জুলাই: "July",
  আগস্ট: "August",
  সেপ্টেম্বর: "September",
  অক্টোবর: "October",
  নভেম্বর: "November",
  ডিসেম্বর: "December",
};
