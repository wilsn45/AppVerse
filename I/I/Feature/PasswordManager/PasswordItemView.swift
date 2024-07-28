//
//  PasswordItemView.swift
//  I
//
//  Created by Wilson.Shakya on 28/07/24.
//

import Foundation
import SwiftUI
import SwiftData

struct PasswordItemView: View {

	let item: String

	var body: some View {
		HStack {
			Text(item)
				.font(.headline)
			Spacer()
		}
		.padding()
		.background(Color.gray.opacity(0.1))
		.cornerRadius(8)
	}


	private func addNewPassword() {

	}
}


#Preview {
	PasswordItemView(item: "Password A")
}
