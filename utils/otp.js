export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const otpExpireTime = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 min
};

export const canResendOtp = (lastResendTime) => {
  if (!lastResendTime) return true;

  const diff = Date.now() - new Date(lastResendTime).getTime();
  return diff >= 30 * 1000; // 30 sec
};
