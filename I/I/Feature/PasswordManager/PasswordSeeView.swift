//
//  PasswordSeeView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation

import SwiftUI

struct PasswordSeeView: View {
	let item: String

	var body: some View {
		VStack {
			Text("Details for \(item)")
				.font(.largeTitle)
				.padding()
			Spacer()
		}
		.frame(width: UIScreen.main.bounds.width / 2, height: 400)
		.background(Color.white)
		.cornerRadius(8)
		.shadow(radius: 10)
	}
}

#Preview {
	PasswordSeeView(item: "Password A")
}
