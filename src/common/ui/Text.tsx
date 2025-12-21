import React from "react";
import localFont from "next/font/local";

const body_Font_Medium = localFont({
  src: "../fonts/Big_Caslon_CC/Big_Caslon_CC_Black.otf",
});

const body_Font_Regular = localFont({
  src: "../fonts/Big_Caslon_CC/Big_Caslon_CC.otf",
});

const body_Font_Light = localFont({
  src: "../fonts/Big_Caslon_CC/Big_Caslon_CC.otf",
});

const body_Font_Bold = localFont({
  src: "../fonts/Big_Caslon_CC/Big_Caslon_CC_Bold.otf",
});

const body_p_regular = localFont({
  src: "../fonts/Poppins/Poppins-Regular.ttf",
});

const body_p_light = localFont({
  src: "../fonts/Poppins/Poppins-Light.ttf",
});

const body_S_light = localFont({
  src: "../fonts/Glitch/Glitch.ttf",
});

// Header Component
export const Header1: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h1
    className={`text-[40px] sm:text-[100px] leading-12 sm:leading-7 ${body_Font_Regular.className} ${className}`}
  >
    {children}
  </h1>
);

export const Header1Plus: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h1
    className={`text-[16px] sm:text-[36px] ${body_Font_Regular.className} ${className}`}
  >
    {children}
  </h1>
  );

  export const Header2Plus: React.FC<{
    children: React.ReactNode;
    className?: string;
  }> = ({ children, className = "" }) => (
    <h1
      className={` ${body_Font_Regular.className} ${className}`}
    >
      {children}
    </h1>
  );

export const Header2: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h2
    className={`text-[20px] sm:text-[32px] leading-12 sm:leading-12 font-bold ${body_Font_Bold.className} ${className}`}
  >
    {children}
  </h2>
);

export const Header3: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3
    className={`text-[20px] sm:text-[24px] md:text-[32px]   font-bold ${body_Font_Regular.className} ${className}`}
  >
    {children}
  </h3>
);

export const Header4: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h4
    className={`text-[20px] sm:text-[24px]    font-bold ${body_Font_Regular.className} ${className}`}
  >
    {children}
  </h4>
);

export const Header5: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h4
    className={`text-[16px] sm:text-[18px] font-bold ${body_p_regular.className} ${className}`}
  >
    {children}
  </h4>
);

export const HeaderAny: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h4 className={` ${body_Font_Regular.className} ${className}`}>{children}</h4>
);

export const SpecialH1: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h4 className={` text-[20px] sm:text-[50px] ${body_S_light.className} ${className}`}>{children}</h4>
);

// Paragraph Component
export const Paragraph1: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h1
    className={`text-[14px] sm:text-[14px]     ${body_p_regular.className} ${className}`}
  >
    {children}
  </h1>
);

export const Paragraph2: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <p
    className={`text-[18px] sm:text-[28px] font-bold leading-6  sm:leading-7   ${body_p_regular.className} ${className}`}
  >
    {children}
  </p>
);

export const Paragraph3: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <p
    className={` leading-6  sm:leading-7 text-[16px] sm:text-[18px]   ${body_p_light.className} ${className}`}
  >
    {children}
  </p>
);

export const ParagraphLink1: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h1
    className={`text-[13px] sm:text-[13px] font-medium   leading-6 sm:leading-7  hover:scale-105 transition-transform duration-300  ${body_p_regular.className} ${className}`}
  >
    {children}
  </h1>
);

export const ParagraphLink2: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h1
    className={`   hover:scale-105 transition-transform duration-300 text-[13px] sm:text-[13px] ${body_p_regular.className} ${className}`}
  >
    {children}
  </h1>
);
