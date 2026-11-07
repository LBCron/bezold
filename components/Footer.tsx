import Link from "next/link";
import Image from "next/image";
import {
  InstagramFilled,
  YoutubeFilled,
  FacebookFilled,
  LinkedinFilled,
} from "@ant-design/icons";
import LineIcon from "./icon/LineIcon";
import ThreadsIcon from "./icon/ThreadsIcon";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 px-6 min-h-[100px]">
      <div className="flex flex-col md:flex-row justify-between items-center md:justify-start gap-2">
        {/* Logo */}
        <Link className="mb-4 md:mb-0" href="/">
          <Image
            src="/bezold-removebg-rect.png"
            alt="bezold logo"
            width={150}
            height={40}
            className="h-auto"
          />
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-wrap justify-start gap-6 mb-4 md:mb-0 md:pl-32">
          <Link href="/how" className="hover:text-gray-300">
            如何刊登
          </Link>
          <Link href="/store-list?category=all" className="hover:text-gray-300">
            店家列表
          </Link>
          {/* <Link href="/learn" className="hover:text-gray-300">
            創業知識
          </Link> */}
          {/* <Link href="/about" className="hover:text-gray-300">
            關於我們
          </Link> */}
          {/* <Link href="/success-stories" className="hover:text-gray-300">
                成功故事
              </Link> */}
        </nav>

        {/* Social Media Icons */}
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/bezoldtw/"
            className="hover:text-gray-300"
            aria-label="Instagram"
            target="_blank"
          >
            <InstagramFilled className="text-2xl" />
          </a>
          <a
            href="https://www.youtube.com/@Bezold-v4u"
            className="hover:text-gray-300"
            aria-label="YouTube"
            target="_blank"
          >
            <YoutubeFilled className="text-2xl" />
          </a>
          <a
            href="https://line.me/R/ti/p/@316zvvmj"
            className="hover:text-gray-300"
            aria-label="Line"
            target="_blank"
          >
            <LineIcon className="text-2xl" />
          </a>
          <a
            href="https://www.facebook.com/share/19BX272yzL/?mibextid=wwXIfr"
            className="hover:text-gray-300"
            aria-label="Facebook"
            target="_blank"
          >
            <FacebookFilled className="text-2xl" />
          </a>
          <a
            href="https://www.linkedin.com/in/bezold-tw-98390936b"
            className="hover:text-gray-300"
            aria-label="LinkedIn"
            target="_blank"
          >
            <LinkedinFilled className="text-2xl" />
          </a>
          <a
            href="https://www.threads.com/@bezoldtw"
            className="hover:text-gray-300"
            aria-label="Threads"
            target="_blank"
          >
            <ThreadsIcon className="text-2xl" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
