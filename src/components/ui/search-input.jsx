import React from "react";
import WebIcon from "../custom/WebIcons";

const SearchInput = ({
	value,
	onChange,
	placeholder = "Search by name, status, class....",
	className = "",
	style,
}) => {
	return (
		<div className={`relative ${className}`} style={style}>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				placeholder={placeholder}
				className="px-4 pr-10 border border-gray-300 rounded-[100px] shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
				style={{ width: "469px", height: "32px" }}
			/>
			<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
				<WebIcon icon="search" className="w-4 h-4 text-gray-400" />
			</div>
		</div>
	);
};

export default SearchInput;
