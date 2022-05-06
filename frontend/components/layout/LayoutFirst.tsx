import Head from "next/head";

function LayoutFirst (props: { children: any }){

    return (
        <div>
            <Head>
                <script
                  src="https://upload-widget.cloudinary.com/global/all.js"
                  type="text/javascript"
                ></script>
            </Head>
            <main >
                {props.children}
            </main>
        </div>
    );
}

export default LayoutFirst;