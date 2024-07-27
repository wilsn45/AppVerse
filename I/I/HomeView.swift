//
//  HomeView.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI
import SwiftData

struct HomeView: View {
	@State private var path = NavigationPath()

	var body: some View {
		NavigationStack(path: $path)  {
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
							.padding(.horizontal, 20)
							.padding(.vertical, 10)
						}
						.background(AppColor.backgroundWhite)
						.clipShape(RoundedRectangle(cornerRadius: 15))
						.shadow(color: AppColor.borderGrey, radius: 10, x: 0, y: 5)

						VStack(spacing: 50) {
							HStack {
								FeatureOptionView(type: .gallery) {
									path.append(FeatureType.gallery.rawValue)
								}
								Spacer()
								FeatureOptionView(type: .notes) {
									path.append(FeatureType.notes.rawValue)
								}
								Spacer()
							}

							HStack {
								FeatureOptionView(type: .finance) {
									path.append(FeatureType.finance.rawValue)
								}

								Spacer()
								FeatureOptionView(type: .password) {
									path.append(FeatureType.password.rawValue)
								}
								Spacer()
							}

							HStack {
								FeatureOptionView(type: .links)  {
									path.append(FeatureType.links.rawValue)
								}
								Spacer()
							}
						}
						.padding(20)
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
