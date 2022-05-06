import MainNavigation from './MainNavigation';
import Head from "next/head";

function Layout (props: { children: any }){

    return (
        <div>
            <Head>
                <script
                  src="https://upload-widget.cloudinary.com/global/all.js"
                  type="text/javascript"
                ></script>
            </Head>
            <MainNavigation />
            <main >
                {props.children}
            </main>
        </div>
    );
}

export default Layout;