//
//  HomeView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI
import SwiftData

struct HomeView: View {
	@EnvironmentObject var navigationModel: NavigationModel

	let featureList: [FeatureType] = [.gallery, .notes, .finance, .password, .links]

	var body: some View {
		NavigationStack(path: $navigationModel.path)  {
			VStack {
				VStack {
					VStack(spacing: 20) {
						HStack {
							Text("Hello User")
							Spacer()
							NavigationLink(destination: GalleryView()) {
								Text("User Image")
							}
						}
						VStack {
							HStack {
								HStack {
									HStack {
										Text("weather Image")
										VStack {
											Text("weather text")
											Text("weather value")
										}
									}
								}

								HStack {
									HStack {
										Text("Time Image")
										VStack {
											Text("Time text")
											Text("Time value")
										}
									}
								}
							}
							.frame(width:  (UIScreen.main.bounds.width - 100))
							.padding(.horizontal, 20)
							.padding(.vertical, 10)
						}
						.background(AppColor.backgroundWhite)
						.clipShape(RoundedRectangle(cornerRadius: 15))
						.shadow(color: AppColor.borderGrey, radius: 10, x: 0, y: 5)

						let columns = [
							GridItem(.flexible()),
							GridItem(.flexible())
						]

						ScrollView {
							LazyVGrid(columns: columns, spacing: 16) {
								ForEach(featureList, id: \.self) { item in
									FeatureOptionView(type: item) {
										navigationModel.path.append(item.rawValue)
									}
								}
							}
						}.scrollIndicators(.hidden)
					}
					Spacer()
				}
				.padding(.top, 20)
				.padding(.leading, 20)
				.padding(.trailing, 20)

			}.background(AppColor.backgroundGrey)
				.navigationDestination(for: String.self) { view in
					navigationView(for: view)
				}
		}
	}

	private func navigationView(for feature: String) -> some View {
		switch feature {
			case FeatureType.gallery.rawValue:
				return AnyView(GalleryView())
			case FeatureType.notes.rawValue:
				return AnyView(NotesView())
			case FeatureType.finance.rawValue:
				return AnyView(FinanceView())
			case FeatureType.password.rawValue:
				return AnyView(PasswordView())
			case FeatureType.links.rawValue:
				return AnyView(LinksView())
			default: return AnyView(Text("Unknown feature"))
		}
	}

}

//#Preview {
//	HomeView()
//}
