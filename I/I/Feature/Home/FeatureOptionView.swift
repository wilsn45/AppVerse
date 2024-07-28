//
//  FeatureOptionView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import Foundation
import SwiftUI

struct FeatureOptionView: View {
	let type: FeatureType
	let action: (() -> Void)

	var body: some View {
		Button(action: {
			action()
			print("Button inside NavigationLink tapped")
		}) {
			VStack {
				Text("Feature Icon")
				Text(type.title)
			}
			.frame(width: (UIScreen.main.bounds.width / 2) - 40, height: 150)
		}.background(AppColor.backgroundWhite)
		.clipShape(RoundedRectangle(cornerRadius: 15))
		.shadow(color: AppColor.borderGrey, radius: 10, x: 0, y: 5)
	}

}


enum FeatureType: String {
	case gallery
	case notes
	case password
	case finance
	case links

	var title: String {
		switch self {
			case .gallery:
				return "Gallery"
			case .notes:
				return "Notes"
			case .password:
				return "Password"
			case .finance:
				return "Finance"
			case .links:
				return "Links"
		}
	}
}
