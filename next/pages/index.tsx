import NextLink from "next/link";
import { Link } from "@chakra-ui/react";
import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div>
      Go to{" "}
      <NextLink href="/test">
        <Link color="teal">test</Link>
      </NextLink>
    </div>
  );
};

export default Home;
