import Stripe from "stripe";
// pk_test_51NliEfA2za6TBvVleRi6k5iWrwf0deEyMhiBYd3CpPnkZjwQIQwsduwH6ucrg6hILFfuZYklywxdKqgaIdyHwjnY00EA4O63pt

export const stripe = new Stripe(
  "sk_test_51NliEfA2za6TBvVlKGI9c8KhVwPhza2RlGEcFRtywjsNPQTLogp4NuxX0Co9PIjLhhSuSmbvMprlEcWkFlijpCYT00IeuKEGpE",
  {
    apiVersion: "2023-08-16",
    typescript: true,
  }
);
