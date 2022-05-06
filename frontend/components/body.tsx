import React from "react";

const Body = ({ content }) => {
	return (
		<div className="wrapper">
			<div className="page_layout">
				{content}
			</div>
		</div>
	)
};

export default Body;
