//
//  PasswordAddView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI

struct PasswordAddView: View {

	var body: some View {
		VStack {
			Text("Add Password")
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
	PasswordAddView()
}
