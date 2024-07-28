//
//  PasswordView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import Foundation
import SwiftUI
import SwiftData

struct PasswordView: View {
	@State private var selectedItem: String? = nil
	let items = ["Item 1", "Item 2", "Item 3", "Item 4"]
	@State private var isSheetPresented: Bool = false
	@State private var showPasswordDetailView: Bool = false
	@State private var showAddPasswordView: Bool = false

	var body: some View {
		ZStack {
			VStack {
				List(items, id: \.self) { item in
					PasswordItemView(item: item)
						.onTapGesture {
							selectedItem = item
							showPasswordDetailView = true
						}
				}

				HStack {
					Spacer()

					Button(action: {
						showAddPasswordView = true
					}) {
						Image(systemName: "plus")
							.font(.system(size: 24))
							.foregroundColor(.white)
							.padding()
							.background(Color.blue)
							.clipShape(Circle())
					}

				}


			}
			.navigationTitle("Password Manager")

			if showPasswordDetailView {
				Color.black.opacity(0.4)
					.edgesIgnoringSafeArea(.all)
					.onTapGesture {
						showPasswordDetailView = false
					}

				if let selectedItem = selectedItem {
					PasswordSeeView(item: selectedItem)
						.transition(.scale)
						.zIndex(1)
				}
			}


			if showAddPasswordView {
				Color.black.opacity(0.4)
					.edgesIgnoringSafeArea(.all)
					.onTapGesture {
						showAddPasswordView = false
					}

				if let selectedItem = selectedItem {
					PasswordAddView()
						.transition(.scale)
						.zIndex(1)
				}
			}
		}
	}


	private func addNewPassword() {

	}
}


#Preview {
	PasswordView()
}
