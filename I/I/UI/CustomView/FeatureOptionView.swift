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

	var body: some View {
		Button(action: {

		}) {
			Text(type.title)
				.frame(width: 100, height: 100)
		}.background(Color.clear)
			.overlay(
				RoundedRectangle(cornerRadius: 10)
					.stroke(Color.blue, lineWidth: 2)
			)
			.background(AppColor.backgroundWhite)
	}

}


enum FeatureType {
	case gallery
	case notes
	case password
	case finance

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
		}
	}
}
