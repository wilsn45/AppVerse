//
//  IApp.swift
//  I
//
//  Created by Wilson.Shakya on 27/07/24.
//

import SwiftUI

@main

struct IApp: App {
	init() {
		CoreDataManager.shared.loadContainer()
	}

	@StateObject private var navigationManager = NavigationManager()


	var body: some Scene {
		WindowGroup {
//			ScreenA()
//				.environmentObject(navigationManager)


			HomeView()
				.environmentObject(navigationManager)
		}
	}
}


