import Link from "next/link";
import { Paragraph1 } from "@/common/ui/Text";

const TrustFooter = () => {
  return (
    <div className="mt-24 w-full justify-center items-center flex flex-col  ">
      {/* Privacy Message */}
      <Paragraph1 className="text-sm text-gray-600 text-center max-w-150 [600px] leading-relaxed">
        All your personal and financial details are kept private and are never
        shared with any third party or financial institution.
        <Link
          href="/privacy-policy"
          className="ml-1 font-medium text-blue-600 hover:underline"
        >
          Learn more in our Privacy Policy
        </Link>
        .
      </Paragraph1>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-gray-200" />

      {/* Copyright */}
      <Paragraph1 className="text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} PasBills. All rights reserved.
      </Paragraph1>
    </div>
  );
};

export default TrustFooter;
